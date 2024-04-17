/*
*   File: espCN.h
*   Date: 20240417
*   Author: neko0xff
*/

#ifndef espCN_h
#define espCN_h

#include <Arduino.h>

class espCN {
public:
    /*內容定義*/
    espCN() {
        /* WIFI AP 設定 */
        ssid = "";
        password = "";

        /* 伺服器路徑 */
        deviceName = "Switch01";
        serverPort = "3095";
        serverIP = "";
        serverProtal = "http://";
        API_URL = "read/StatusGet/" + String(deviceName) + "/powerStatus";
        serverName = serverProtal + serverIP + ":" + serverPort + "/" + API_URL;
    }

    /* 變數定義 */
    const char* ssid;        // WIFI SSID
    const char* password;    // WIFI Password
    String deviceName;       // 裝置名稱
    String serverPort;       // 伺服器: 通訊埠
    String serverIP;         // 伺服器: IP
    String serverProtal;     // 伺服器: 通訊協定
    String API_URL;          // 伺服器: 請求來源
    String serverName;       // 伺服器: 完整位置
};

#endif
