"use strict"

const fs = require("fs");
const path = require("path");
const ProcessListener = require("./process-listener");
const { scan_interval: SCAN_INTERVAL, backup: BACKUP } = require('./config.json');

let PatchedProcesses = {};

function HandleAddedProcess(process)
{
    try
    {
        let XigncodeFolder = path.join(path.dirname(process.path), "XIGNCODE");
        
        if(BACKUP)
            fs.renameSync(path.join(XigncodeFolder, "x3.xem"), path.join(XigncodeFolder, "x3.xem.bak"));
        fs.copyFileSync(path.join(__dirname, "res/x3.xem"), path.join(XigncodeFolder, "x3.xem"));
        
        if(BACKUP)
            fs.renameSync(path.join(XigncodeFolder, "xcorona.xem"), path.join(XigncodeFolder, "xcorona.xem.bak"));
        fs.copyFileSync(path.join(__dirname, "res/xcorona.xem"), path.join(XigncodeFolder, "xcorona.xem"));
        
        PatchedProcesses[process.pid] = XigncodeFolder;
        
        console.log(`[xigncode-bypass] Game client (PID ${process.pid}) detected, bypass installed.`);
    }
    catch(e)
    {
        // Ignore errors...
    }
}

function HandleRemovedProcess(pid)
{
    try
    {
        let XigncodeFolder = PatchedProcesses[pid];
        
        if(BACKUP) {
            fs.renameSync(path.join(XigncodeFolder, "x3.xem.bak"), path.join(XigncodeFolder, "x3.xem"));
            fs.renameSync(path.join(XigncodeFolder, "xcorona.xem.bak"), path.join(XigncodeFolder, "xcorona.xem"));
            console.log(`[xigncode-bypass] Game client (PID ${pid}) closed, bypass reverted.`);
        }
        
        delete PatchedProcesses[pid];
        
    }
    catch(e)
    {
        // Ignore errors...
    }
}

ProcessListener("TERA.exe", HandleAddedProcess, HandleRemovedProcess, SCAN_INTERVAL);
console.log("[xigncode-bypass] Ready, waiting for game client to be started!");
