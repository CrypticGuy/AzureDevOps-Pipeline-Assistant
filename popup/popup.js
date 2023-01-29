const getTimeline = document.getElementById("sendmessageid");
const CurrentUrl = document.getElementById("currenturl");
const getFinalYAML = document.getElementById("getFinalYAML")
const getLogsView = document.getElementById("getLogsView")
const getTaskVersion = document.getElementById("getTaskVersion")

function extractInformation(url) {
    let currURL = new URL(url)
    let pathname = currURL.pathname
    let host = currURL.host
    let params = currURL.toJSON().split("?")[1]
    console.log(params)
    let searchparams = new URLSearchParams(params)
    let buildId = searchparams.get('buildId')
    let orgName;
    let project;
    if (host.split('.')[1] == 'visualstudio') {
        orgName = host.split('.')[0]
        project = pathname.split('/')[1]
    } 
    if (host.includes('dev.azure.com')) {
        orgName = pathname.split('/')[1]
        project = pathname.split('/')[2]
    }
    if (buildId == undefined) {
        
    }
    return {
        "orgname": orgName,
        "project": project,
        "buildId": buildId
    }
}

if (getTimeline) {
    getTimeline.onclick = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            url_info = extractInformation(tabs[0].url)
            chrome.tabs.create({"url": `https://dev.azure.com/${url_info['orgname']}/${url_info['project']}/_apis/build/builds/${url_info['buildId']}/timeline?api-version=6.0`})
            // https://dev.azure.com/{organization}/{project}/_apis/build/builds/{buildId}/timeline
            // chrome.tabs.create({"url": "https://o365exchange.visualstudio.com/O365%20Core/_git/DeploymentStd1B?path=/sources/dev/Extensions/Common/Telemetry/Models/BuildInfo.cs"});
        });
    };
}

if (getFinalYAML) {
    getFinalYAML.onclick = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            url_info = extractInformation(tabs[0].url)
            chrome.tabs.create({"url": `https://dev.azure.com/${url_info['orgname']}/${url_info['project']}/_apis/build/builds/${url_info['buildId']}/logs/1`})
            // https://dev.azure.com/{organization}/{project}/_apis/build/builds/{buildId}/timeline
            // chrome.tabs.create({"url": "https://o365exchange.visualstudio.com/O365%20Core/_git/DeploymentStd1B?path=/sources/dev/Extensions/Common/Telemetry/Models/BuildInfo.cs"});
        });
    };
}

if (getLogsView) {
    getLogsView.onclick = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            url_info = extractInformation(tabs[0].url)
            // console.log(`https://dev.azure.com/${url_info['orgname']}/${url_info['project']}/_build/results?buildId=${url_info['buildId']}&view=logs`)
            chrome.tabs.create({"url": `https://dev.azure.com/${url_info['orgname']}/${url_info['project']}/_build/results?buildId=${url_info['buildId']}&view=logs`})
            // https://dev.azure.com/{organization}/{project}/_apis/build/builds/{buildId}/timeline
            // chrome.tabs.create({"url": "https://o365exchange.visualstudio.com/O365%20Core/_git/DeploymentStd1B?path=/sources/dev/Extensions/Common/Telemetry/Models/BuildInfo.cs"});
        });
    }
}

function getJSON() { 
    // # f89744ab-807f-45c3-9761-bb0a3414d4dd
    // # f3669b85-73f2-436d-9391-3ebd8061b38c
    // # a8534dce-3050-4b23-9843-336458a59bc3
    // # 2b97374b-e8b0-4a3b-adce-3405efca44b5
    let json_string = document.querySelector("pre").innerHTML;
    let parsed_json = JSON.parse(json_string)
    return parsed_json
}

const TaskIds = ["f89744ab-807f-45c3-9761-bb0a3414d4dd", "f3669b85-73f2-436d-9391-3ebd8061b38c", "a8534dce-3050-4b23-9843-336458a59bc3", "2b97374b-e8b0-4a3b-adce-3405efca44b5"]

if (getTaskVersion) {
    getTaskVersion.onclick = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting
            .executeScript({
            target : {tabId : tabs[0].id},
            func : getJSON,
            })
            .then((value) => {
                let output = []
                const result = value[0]["result"]
                console.log(Object.keys(result))
                const values = result["value"]
                console.log(TaskIds)
                values.forEach((item) => {
                    if (TaskIds.includes(item['id'])) {
                        console.log("MATCH")
                        output.push([item['id'], item['name'], item['version'], item['contributionVersion']])
                    }
                })
                console.log(output)
                let bodyTag = document.getElementsByTagName("body")[0]
                let holderTag = document.getElementById("versionString")
                let versionString = "<table id='versionString'><tr><th>Task Guid</th><th>Task Identifier</th><th>Task Version</th><th>Extension Version</th></tr>"
                output.forEach((item) => {
                    versionString += `<tr><td>${item[0]}</td><td>${item[1]}</td><td>${item[2]['major']}.${item[2]['minor']}.${item[2]['patch']}</td><td>${item[3]}</td></tr>`
                })
                versionString += "</table>"
                if (holderTag) {
                    holderTag.innerHTML = versionString
                } else {
                    bodyTag.innerHTML += versionString
                }
            });
        });
    }
}

