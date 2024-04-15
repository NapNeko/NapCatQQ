import fs from 'fs'
import path from 'path'
import { version } from '../src/onebot11/version'

const manifestPath = path.join(__dirname, '../package.json')

function readManifest (): any {
    if (fs.existsSync(manifestPath)) {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    }
}

function writeManifest (manifest: any) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

const manifest = readManifest()
if (version !== manifest.version) {
    manifest.version = version
    writeManifest(manifest)
}
