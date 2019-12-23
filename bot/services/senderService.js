
const { StringDecoder } = require("string_decoder");
const WebSocket = require("ws");

const { WebSocketClient } = require("../../client/js/WebSocketClient");
const { BootstrapStep } = require("../../client/js/BootstrapStep.js");

let backendInfo = {
    url: "ws://localhost:2020",
    timeout: 10000
};

class SenderService {
    constructor(clientWebsocketRaw, backendWebsocket) {
        console.log('received a web connection and starting the webSocket Client');
        this.clientWebsocket = new WebSocketClient().initializeFromRaw(clientWebsocketRaw, "api2client", { getOnMessageData: msg => new StringDecoder("utf-8").write(msg.data) });
        this.backendWebsocket = backendWebsocket;
        this.init();
    }

    async init() {
        this.clientWebsocket.send({ type: "connected" });
        this.clientWebsocket.waitForMessage({
            condition: obj => obj.from == "client" && obj.type == "call" && obj.command == "api-connectBackend",
            keepWhenHit: true
        }).then(clientCallRequest => {
            if (this.backendWebsocket.isOpen)
                return;
            new BootstrapStep({
                websocket: this.backendWebsocket,
                actor: websocket => {
                    websocket.initialize(backendInfo.url, "api2backend", { func: WebSocket, args: [{ perMessageDeflate: false }], getOnMessageData: msg => new StringDecoder("utf-8").write(msg.data) });
                    websocket.onClose(() => {
                        this.clientWebsocket.send({ type: "resource_gone", resource: "backend" });
                    });
                },
                request: {
                    type: "waitForMessage",
                    condition: obj => obj.from == "backend" && obj.type == "connected"
                }
            }).run(backendInfo.timeout).then(backendResponse => {
                clientCallRequest.respond({ type: "resource_connected", resource: "backend" });
            }).catch(reason => {
                clientCallRequest.respond({ type: "error", reason: reason });
            });
        }).run();

        this.clientWebsocket.waitForMessage({
            condition: obj => obj.from == "client" && obj.type == "call" && obj.command == "backend-connectWhatsApp",
            keepWhenHit: true
        }).then(clientCallRequest => {
            if (!this.backendWebsocket.isOpen) {
                clientCallRequest.respond({ type: "error", reason: "No backend connected." });
                return;
            }
            new BootstrapStep({
                websocket: this.backendWebsocket,
                request: {
                    type: "call",
                    callArgs: { command: "backend-connectWhatsApp" },
                    successCondition: obj => obj.type == "resource_connected" && obj.resource == "whatsapp" && obj.resource_instance_id
                }
            }).run(backendInfo.timeout).then(backendResponse => {
                this.backendWebsocket.activeWhatsAppInstanceId = backendResponse.data.resource_instance_id;
                this.backendWebsocket.waitForMessage({
                    condition: obj => obj.type == "resource_gone" && obj.resource == "whatsapp",
                    keepWhenHit: false
                }).then(() => {
                    delete this.backendWebsocket.activeWhatsAppInstanceId;
                    this.clientWebsocket.send({ type: "resource_gone", resource: "whatsapp" });
                });
                clientCallRequest.respond({ type: "resource_connected", resource: "whatsapp" });
            }).catch(reason => {
                clientCallRequest.respond({ type: "error", reason: reason });
            });
        }).run();

        this.clientWebsocket.waitForMessage({
            condition: obj => obj.from == "client" && obj.type == "call" && obj.command == "backend-disconnectWhatsApp",
            keepWhenHit: true
        }).then(clientCallRequest => {
            if (!this.backendWebsocket.isOpen) {
                clientCallRequest.respond({ type: "error", reason: "No backend connected." });
                return;
            }
            new BootstrapStep({
                websocket: this.backendWebsocket,
                request: {
                    type: "call",
                    callArgs: { command: "backend-disconnectWhatsApp", whatsapp_instance_id: this.backendWebsocket.activeWhatsAppInstanceId },
                    successCondition: obj => obj.type == "resource_disconnected" && obj.resource == "whatsapp" && obj.resource_instance_id == this.backendWebsocket.activeWhatsAppInstanceId
                }
            }).run(backendInfo.timeout).then(backendResponse => {
                clientCallRequest.respond({ type: "resource_disconnected", resource: "whatsapp" });
            }).catch(reason => {
                clientCallRequest.respond({ type: "error", reason: reason });
            });
        }).run();

        this.clientWebsocket.waitForMessage({
            condition: obj => obj.from == "client" && obj.type == "call" && obj.command == "backend-generateQRCode",
            keepWhenHit: true
        }).then(clientCallRequest => {
            if (!this.backendWebsocket.isOpen) {
                clientCallRequest.respond({ type: "error", reason: "No backend connected." });
                return;
            }
            new BootstrapStep({
                websocket: this.backendWebsocket,
                request: {
                    type: "call",
                    callArgs: { command: "backend-generateQRCode", whatsapp_instance_id: this.backendWebsocket.activeWhatsAppInstanceId },
                    successCondition: obj => obj.from == "backend" && obj.type == "generated_qr_code" && obj.image && obj.content
                }
            }).run(backendInfo.timeout).then(backendResponse => {
                clientCallRequest.respond({ type: "generated_qr_code", image: backendResponse.data.image })

                this.backendWebsocket.waitForMessage({
                    condition: obj => obj.type == "whatsapp_message_received" && obj.message && obj.message_type && obj.timestamp && obj.resource_instance_id == this.backendWebsocket.activeWhatsAppInstanceId,
                    keepWhenHit: true
                }).then(whatsAppMessage => {
                    if(!this.clientInfo && !this.clientInfoRequest) {
                        this.clientInfoRequest = true;
                        this.getLoginInfo();
                    }
                    let d = whatsAppMessage.data;
                    this.clientWebsocket.send({ type: "whatsapp_message_received", message: d.message, message_type: d.message_type, timestamp: d.timestamp });
                }).run();
            }).catch(reason => {
                clientCallRequest.respond({ type: "error", reason: reason });
            })
        }).run();
    }

    async listenForResourceConnection() {
        
    }

    async getLoginInfo() {
        console.log('getting login info ');
        new BootstrapStep({
            websocket: this.backendWebsocket,
            request: {
                type: "call",
                callArgs: { command: "backend-getLoginInfo", whatsapp_instance_id: this.backendWebsocket.activeWhatsAppInstanceId },
                successCondition: obj => obj.from == "backend" && obj.type === "login_info" && obj.data
            }
        }).run(backendInfo.timeout).then(backendResponse => {
            console.log('backend response from gettting login info', backendResponse);
            this.clientInfoRequest = false;
        }).catch(reason => {
            console.log('error getting login info', reason);
        })
    }
}

module.exports = SenderService