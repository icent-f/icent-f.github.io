# Wireshark(简)

这个东西有点多 感觉不太容易写体系（主要我也没学完） 所以写的可能会有点乱

Wireshark 是 CTF 取证、流量分析的核心工具 用于分析数据包、提取文件和发现攻击痕迹

先看显示过滤器吧 可以拿来过滤流量包

| 过滤器                                  | 作用                                         | 示例                                        |
| --------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| `http`                                  | 只显示 HTTP 协议                             |                                             |
| `tcp`                                   | 只显示 TCP 协议                              |                                             |
| `udp`                                   | 只显示 UDP 协议                              |                                             |
| `dns`                                   | 只显示 DNS 流量                              |                                             |
| `icmp`                                  | 只显示 ICMP（ping等）                        |                                             |
| `dns.qry.name`                          | 查看所有查询域名 适合检测 DNS 隧道或隐藏信息 |                                             |
| `tcp.port ==`                           | 源或目的端口为80                             | `tcp.port == 80`                            |
| `udp.port ==`                           | DNS 常用                                     | `udp.port == 53`                            |
| `ip.addr ==`                            | 源或目的 IP 等于指定值                       | `ip.addr == 192.168.1.1`                    |
| `ip.src ==`                             | 源 IP                                        | `ip.src == 10.0.0.1`                        |
| `ip.dst ==`                             | 目的 IP                                      | `ip.dst == 10.0.0.2`                        |
| `http.request.method == ""`             | 通过请求方式筛选 HTTP 请求                   | `http.request.method == "POST"`             |
| `tcp.flags.syn == and tcp.flags.ack ==` | 仅 SYN 包（连接发起）                        | `tcp.flags.syn == 1 and tcp.flags.ack == 0` |
| `http contains ""`                      | 搜索 HTTP 内容包含某字符串                   | 同样可用 `http contains "password"`         |
| `frame contains ""`                     | 在数据包字节中搜索字符串                     | `frame contains "PNG"`                      |
| `tcp.payload[] ==`                      | 匹配 TCP 负载开头 4 字节（如 PNG 头）        | `tcp.payload[0:4] == 89:50:4e:47`           |

这些词条还可以通过以下方式联合过滤

`&&` -> 与
`||` -> 或
`!` -> 非
`()` -> 分组

例：`http && ip.src == 10.0.0.5`  
例：`tcp.port == 80 || tcp.port == 443`

还有一些常用的操作

- **追踪流**  
   右键任意包 -> `Follow` -> `TCP/UDP/HTTP Stream`  
   可完整查看请求内容与响应内容

- **导出传输文件**  
   `File` -> `Export Objects` -> `HTTP/IMF/FTP`  
   一键列出并保存所有通过 HTTP 等协议传输的文件

- **搜索字符串**  
   `Ctrl+F`
  选择“String”，在包字节中搜索

- **统计信息**
  - `Statistics -> Protocol Hierarchy`：查看流量协议分布
  - `Statistics -> Conversations`：查看 IP/端口间的会话
  - `Statistics -> HTTP → Requests`：统计所有 HTTP 请求

- **解密 TLS/SSL**  
   `Edit → Preferences` → `Protocols` → `TLS/RSA Keys`  
   导入 Key File 或设置 `SSLKEYLOGFILE`

Wireshark 还有个命令行工具叫 tshark
