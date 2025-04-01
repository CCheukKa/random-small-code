const data = document.getElementById("data");
const pw = document.getElementById("pw");
const encryptButton = document.getElementById("encrypt");
const encrypted = document.getElementById("encrypted");
const decryptButton = document.getElementById("decrypt");
const decrypted = document.getElementById("decrypted");
const statusElement = document.getElementById("status") || document.createElement("div");

async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const importedKey = await window.crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        importedKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    return derivedKey;
}

async function encryptData(text, password) {
    try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(text);

        const salt = window.crypto.getRandomValues(new Uint8Array(16));

        const key = await deriveKey(password, salt);

        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            dataBuffer
        );

        const resultBuffer = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
        resultBuffer.set(salt, 0);
        resultBuffer.set(iv, salt.length);
        resultBuffer.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

        return btoa(String.fromCharCode(...resultBuffer));
    } catch (error) {
        console.error("Encryption error:", error);
        return null;
    }
}

async function decryptData(encryptedBase64, password) {
    try {
        const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

        const salt = encryptedData.slice(0, 16);
        const iv = encryptedData.slice(16, 28);
        const encryptedBuffer = encryptedData.slice(28);

        const key = await deriveKey(password, salt);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encryptedBuffer
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        console.error("Decryption error:", error);
        return "Decryption failed! Incorrect password or corrupted data.";
    }
}

encryptButton.addEventListener("click", async () => {
    if (!data.value || !pw.value) {
        encrypted.innerHTML = "Please enter both data and password";
        return;
    }

    try {
        const encryptedText = await encryptData(data.value, pw.value);
        encrypted.innerHTML = encryptedText || "Encryption failed";
    } catch (error) {
        encrypted.innerHTML = `Error: ${error.message}`;
    }
});

decryptButton.addEventListener("click", async () => {
    if (!encrypted.innerHTML || !pw.value) {
        decrypted.innerHTML = "Please enter both encrypted data and password";
        return;
    }

    try {
        const decryptedText = await decryptData(encrypted.innerHTML, pw.value);
        decrypted.innerHTML = decryptedText || "Decryption failed!";
    } catch (error) {
        decrypted.innerHTML = `Error: ${error.message}`;
    }
});