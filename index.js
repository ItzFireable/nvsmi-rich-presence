const worker = require('worker_threads');
const clientid = "777277529299746817"
const clientid2 = "777518394534658069"

const smi = require('node-nvidia-smi');
var richpresence = [
    require('discord-rich-presence')(clientid),
    require('discord-rich-presence')(clientid2)
]
const SysTray = require('systray').default;

var fs = require('fs');

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

let enabled = true

const systray = new SysTray({
    menu: {
        // you should using .png icon in macOS/Linux, but .ico format in windows
        icon: base64_encode('./important/nv.ico'),
        title: "nvsmi-rich-presence",
        tooltip: "nvsmi-rich-presence",
        items: [{
            title: "Exit",
            tooltip: "",
            checked: false,
            enabled: true
        }]
    },
    debug: false,
    copyDir: true, // copy go tray binary to outside directory, useful for packing tool like pkg.
})

systray.onClick(action => {
    if (action.seq_id === 0) {
        systray.kill()
    }
})

function hideSelf() {

    let powershellScript = `
    Add-Type -Name Window -Namespace Console -MemberDefinition '
    [DllImport("Kernel32.dll")]
    public static extern IntPtr GetConsoleWindow();

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, Int32 nCmdShow);
    '

    $consolePtr = [Console.Window]::GetConsoleWindow()
    #0 hide
    [Console.Window]::ShowWindow($consolePtr, 0)
    `;

    let workingDir = process.cwd();
    let tempfile = `${workingDir}\\temp.ps1`;
    fs.writeFileSync(tempfile, powershellScript);

    //a little convoluted to get around powershell script execution policy (might be disabled)
    require('child_process').execSync(`type .\\temp.ps1 | powershell.exe -noprofile -`, {stdio: 'inherit'});
    fs.unlinkSync(tempfile); //delete temp file
}

var rpcdata = {}
let start = Date.now()

hideSelf()

setInterval(function() {
    smi(function (err, data) {
        if (err) {
            console.warn(err);
        }
        rpcdata = data
        //console.log(JSON.stringify(data, null, ' '));
    });
},100)

setInterval(function() {
    if (parseInt(rpcdata["nvidia_smi_log"]["attached_gpus"]) < 2) {
        richpresence[0].updatePresence({
            state: rpcdata["nvidia_smi_log"]["gpu"]["temperature"]["gpu_temp"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["temperature"]["gpu_temp"].length - 2) + "°C - " + rpcdata["nvidia_smi_log"]["gpu"]["utilization"]["gpu_util"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["utilization"]["gpu_util"].length - 2) + "% usage",
            details: rpcdata["nvidia_smi_log"]["gpu"]["product_name"],
            startTimestamp: start,
            //smallImageText: rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].length - 2) + "W / " + rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].length - 2) + "W",
            largeImageKey: 'nvidia-logo-1',
            largeImageText: rpcdata["nvidia_smi_log"]["gpu"]["fb_memory_usage"]["used"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["fb_memory_usage"]["used"].length - 4) + " / " + rpcdata["nvidia_smi_log"]["gpu"]["fb_memory_usage"]["total"] + " memory usage, " + rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].length - 2) + "W / " + rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].length - 2) + "W power usage",
            instance: true,
        });
    } else {
        for (i = 0; i < parseInt(rpcdata["nvidia_smi_log"]["attached_gpus"]); i++)
        richpresence[i].updatePresence({
            state: rpcdata["nvidia_smi_log"]["gpu"][i]["temperature"]["gpu_temp"].substring(0, rpcdata["nvidia_smi_log"]["gpu"][i]["temperature"]["gpu_temp"].length - 2) + "°C - " + rpcdata["nvidia_smi_log"]["gpu"][i]["utilization"]["gpu_util"].substring(0, rpcdata["nvidia_smi_log"]["gpu"][i]["utilization"]["gpu_util"].length - 2) + "% usage",
            details: rpcdata["nvidia_smi_log"]["gpu"][i]["product_name"],
            startTimestamp: start,
            //smallImageText: rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].length - 2) + "W / " + rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].length - 2) + "W",
            largeImageKey: 'nvidia-logo-1',
            largeImageText: rpcdata["nvidia_smi_log"]["gpu"][i]["fb_memory_usage"]["used"].substring(0, rpcdata["nvidia_smi_log"]["gpu"][i]["fb_memory_usage"]["used"].length - 4) + " / " + rpcdata["nvidia_smi_log"]["gpu"][i]["fb_memory_usage"]["total"] + " memory usage, " + rpcdata["nvidia_smi_log"]["gpu"][i]["power_readings"]["power_draw"].substring(0, rpcdata["nvidia_smi_log"]["gpu"][i]["power_readings"]["power_draw"].length - 2) + "W / " + rpcdata["nvidia_smi_log"]["gpu"][i]["power_readings"]["power_limit"].substring(0, rpcdata["nvidia_smi_log"]["gpu"][i]["power_readings"]["power_limit"].length - 2) + "W power usage",
            instance: true,
        });
    }
},1000)