# Minecraft Mod Version Compatibility Finder

This program helps you find the compatibility of Minecraft mods with different versions of the game.

## Prerequisites

Before using this program, make sure you have the following installed:

- Node.js
- npm

## Installation

1. Clone this repository to your local machine.
2. Open a terminal and navigate to the project directory.
3. Run the following command to install the required dependencies:

    ```bash
    npm install
    ```

## Usage

1. Open a terminal and navigate to the project directory.
2. ***You can ignore this step if you do not have mods hosted on CurseForge.*** Paste your CurseForge API key into `./config/curseforgeApiKey.txt`; create the file if it does not yet exist. You can get an API key by creating a CurseForge developer account [here](https://console.curseforge.com/).
3. Edit `./config/config.json` to specify the version and mods you want to check compatibility for. See [configuration](#configuration) for more information.
4. Run the following command to start the program:

    ```bash
    node .
    ```

5. A compatibility report (`report.html`) will be generated in the project directory. The report will open in your default web browser automatically.

## Configuration

The `config.json` file is defined as follows:

```json
{
    "version": "<version>",
    "minimumVersion": "<minimumVersion>",
    "modrinthApiUrl": "<url>",
    "modrinthModIDs": [
        "<mod1>",
        "<mod2>",
        "<mod3>"
    ],
    "curseforgeApiUrl": "<url>",
    "curseforgeModIDs": [
        "<mod1>",
        "<mod2>",
        "<mod3>"
    ]
}

```

| Key                 | Type       | Description                                                                                                    |
| ------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `minimumVersion`    | `string`   | Minimum release version of the game. ***The value is coerced to be [SemVer](https://semver.org/)-compliant.*** |
| `modrinthApiUrl`    | `string`   | Modrinth API URL. ***Keep this unchanged unless there is a newer breaking API version.***                      |
| `modrinthModIDs`?   | `string[]` | *Optional.* An array of IDs/slugs for Modrinth mods. Categories are irrelevant.                                |
| `curseforgeApiUrl`  | `string`   | CurseForge API URL. ***Keep this unchanged unless there is a newer breaking API version.***                    |
| `curseforgeModIDs`? | `string[]` | *Optional.* An array of slugs for Curseforge mods. Categories are irrelevant.                                  |

You should replace `<version>`, `<url>`, `<mod1>`, `<mod2>`, etc. with your actual values.

## Contributing

If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Submit a pull request to the main repository.

## License

This project is licensed under the [MIT License](LICENSE).