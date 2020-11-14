const smi = require('node-nvidia-smi');
const DiscordRPC = require('discord-rich-presence')('777277529299746817');

let rpcdata
let start = Date.now()

smi(function (err, data) {
    if (err) {
        console.warn(err);
    }
    rpcdata = data
    //console.log(data["nvidia_smi_log"]["gpu"]["product_name"])
    //console.log(JSON.stringify(data, null, ' '))
});

setTimeout(function() {
    DiscordRPC.updatePresence({
        state: rpcdata["nvidia_smi_log"]["gpu"]["temperature"]["gpu_temp"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["temperature"]["gpu_temp"].length - 2) + "°C - " + rpcdata["nvidia_smi_log"]["gpu"]["utilization"]["gpu_util"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["utilization"]["gpu_util"].length - 2) + "% usage",
        details: rpcdata["nvidia_smi_log"]["gpu"]["product_name"],
        startTimestamp: start,
        //smallImageText: rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].length - 2) + "W / " + rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].length - 2) + "W",
        largeImageKey: 'nvidia-logo-1',
        largeImageText: rpcdata["nvidia_smi_log"]["gpu"]["fb_memory_usage"]["used"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["fb_memory_usage"]["used"].length - 4) + " / " + rpcdata["nvidia_smi_log"]["gpu"]["fb_memory_usage"]["total"] + " memory usage, " + rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_draw"].length - 2) + "W / " + rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].substring(0, rpcdata["nvidia_smi_log"]["gpu"]["power_readings"]["power_limit"].length - 2) + "W power usage",
        instance: true,
      });
},1000,false)