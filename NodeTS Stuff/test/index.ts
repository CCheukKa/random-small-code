import fs from "fs-extra";

const extensions = ["aac", "adt", "adts", "accdb", "accde", "accdr", "accdt", "aif", "aifc", "aiff", "aspx", "avi", "bat", "bin", "bmp", "cab", "cda", "csv", "dif", "dll", "doc", "docm", "docx", "dot", "dotx", "eml", "eps", "exe", "flv", "gif", "htm", "html", "ini", "iso", "jar", "jpg", "jpeg", "m4a", "mdb", "mid", "midi", "mov", "mp3", "mp4", "mp4", "mpeg", "mpg", "msi", "mui", "pdf", "png", "pot", "potm", "potx", "ppam", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx", "psd", "pst", "pub", "rar", "rtf", "sldm", "sldx", "swf", "sys", "tif", "tiff", "tmp", "txt", "vob", "vsd", "vsdm", "vsdx", "vss", "vssm", "vst", "vstm", "vstx", "wav", "wbk", "wks", "wma", "wmd", "wmv", "wmz", "wms", "wpd", "wp5", "xla", "xlam", "xll", "xlm", "xls", "xlsm", "xlsx", "xlt", "xltm", "xltx", "xps", "zip",];

extensions.forEach((extension) => {
    fs.writeFileSync(`./files/${extension}.${extension}`, `This is a ${extension} file.`);
});