
import * as fs from "fs";
import pathModule from "path";

import { INITIAL_RECORD, RECORD_FILE_NAME, TEMP_FOLDER } from "../config/constants";

export function useOfflineFallback(initialPath) {
    if (initialPath.includes('app.asar'))
        initialPath = pathModule.join(initialPath, '..')

    const tempFolderPath = pathModule.join(initialPath, TEMP_FOLDER);
    const recordFilePath = pathModule.join(tempFolderPath, RECORD_FILE_NAME);

    function createTempFolderIfNotPresent() {
        if (!fs.existsSync(tempFolderPath)) {
            fs.mkdirSync(tempFolderPath);
            fs.writeFileSync(
                recordFilePath,
                JSON.stringify(INITIAL_RECORD, null, 2)
            );
        }
    }

    function addItemToTempData(data) {
        const storage = grabJsonTempData();
        storage.inputs.push(data);
        updateJsonTempData(storage)
    }

    const grabJsonTempData = () => JSON.parse(fs.readFileSync(recordFilePath).toString())
    const updateJsonTempData = data => fs.writeFileSync(recordFilePath, JSON.stringify(data, null, 2))

    return { createTempFolderIfNotPresent, addItemToTempData, grabJsonTempData }
}