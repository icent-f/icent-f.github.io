---
title: Volatility
date: 2026-10-09
excerpt: Volatility是一款用python编写的开源的内存取证工具
---

# Volatility

## PART 1 概述

Volatility是一款用python编写的开源的内存取证工具

分为Volatility2与Volatility3 分别使用python2与python3编写

> 一般都是Volatility3 Windows7与Win7前的旧版考虑Volatility2

## PART 2 使用对象

Volatility3作用的文件都是内存镜像文件

Volatility3 支持的内存镜像格式包括：

- Raw（`.raw`/`.mem`/`.dmp`）

- Windows 崩溃转储（`.dmp`）

- VMware（`.vmem`）

- VirtualBox（`.sav`）

- Hyper-V（`.bin`）

- EWF

- LiME

## PART 3 使用方法

如果下载的是python源码 就用python加参数运行

![图片.png](图片/图片%201.png)

如果下载的是exe 直接加参数运行即可

![图片.png](图片/图片%2015.png)

vol2需要

`vol.exe -f [image] --profile=[profile] [plugin]`

而vol3已经不需要指定profile了

`vol.exe -f [image] [plugin]`

这里的 `-f` 就是指定分析的文件

`[image]` 就是内存镜像文件

`[plugin]` 就是插件

### PART 3.1 参数

#### PART 3.1.1 全局参数

| 参数                | 说明                                          |
| ------------------- | --------------------------------------------- |
| `-f, --file`        | 指定要分析的内存镜像文件                      |
| `-o, --output-dir`  | 输出目录，用于存放 dump 出的文件              |
| `-r, --renderer`    | 输出格式：`quick`、`pretty`、`json`、`csv` 等 |
| `-q, --quiet`       | 抑制进度反馈，适合脚本或管道                  |
| `--parallelism`     | 并行模式：`processes`、`threads`、`off`       |
| `-v, --verbose`     | 增加日志详细度，可叠加（如 `-vvv`）           |
| `-l, --log`         | 日志输出到指定文件                            |
| `-p, --plugin-dirs` | 额外插件目录（分号分隔）                      |
| `-s, --symbol-dirs` | 额外符号表目录（分号分隔）                    |
| `-c, --config`      | 从 JSON 文件加载配置                          |
| `-e, --extend`      | 单条配置项覆盖，格式 `name=value`             |
| `--save-config`     | 保存当前配置到 JSON 文件                      |
| `--cache-path`      | 自定义缓存路径                                |
| `--clear-cache`     | 清除短期缓存                                  |
| `--offline`         | 离线模式，不联网下载符号表                    |

#### PART 3\.1\.2 插件专属参数

插件参数必须写在插件名之后 且不支持单字母简写

| 参数             | 说明             | 适用插件示例                                            |
| ---------------- | ---------------- | ------------------------------------------------------- |
| `--pid <PID>`    | 限定分析某个进程 | `windows.dlllist`, `windows.handles`, `windows.vadinfo` |
| `--dump`         | 将结果转储为文件 | `windows.memmap`, `windows.malfind`                     |
| `--yara-rules`   | 指定 YARA 规则   | `yarascan`                                              |
| `--strings-file` | 指定字符串文件   | `windows.strings`                                       |

查看具体插件的参数可以用

`vol <plugin_name> --help`

例如 `vol windows.pslist --help` 会显示该插件支持的所有参数

### PART 3.2 插件

#### PART 3.2.1 Windows 插件

| 插件                            | 说明                                                  |
| ------------------------------- | ----------------------------------------------------- |
| `windows.info`                  | 显示正在分析的内存样本的 OS 和内核详细信息            |
| `windows.callbacks`             | 列出内核回调和通知例程                                |
| `windows.cmdline`               | 列出进程命令行参数                                    |
| `windows.dlldump`               | 将进程内存范围 DLL 转储                               |
| `windows.dlllist`               | 列出 Windows 内存映像中已加载的 dll 模块              |
| `windows.driverirp`             | 在 Windows 内存映像中列出驱动程序的 IRP               |
| `windows.driverscan`            | 扫描 Windows 内存映像中存在的驱动程序                 |
| `windows.filescan`              | 扫描 Windows 内存映像中存在的文件对象                 |
| `windows.handles`               | 列出进程打开的句柄                                    |
| `windows.hashdump`              | 从内存中提取 Windows 本地用户的密码哈希               |
| `windows.malfind`               | 列出可能包含注入代码的进程内存范围                    |
| `windows.mftscan`               | 扫描内存中残留的 NTFS 主文件表记录 并解析出文件元数据 |
| `windows.moddump`               | 转储内核模块                                          |
| `windows.modscan`               | 扫描 Windows 内存映像中存在的模块                     |
| `windows.mutantscan`            | 扫描 Windows 内存映像中存在的互斥锁                   |
| `windows.pslist`                | 列出 Windows 内存映像中存在的进程                     |
| `windows.psscan`                | 扫描 Windows 内存映像中存在的进程                     |
| `windows.pstree`                | 列出进程树                                            |
| `windows.procdump`              | 转储处理可执行映像                                    |
| `windows.registry.certificates` | 列出注册表中存储的证书                                |
| `windows.registry.hivelist`     | 列出内存映像中存在的注册表配置单元                    |
| `windows.registry.hivescan`     | 扫描 Windows 内存映像中存在的注册表配置单元           |
| `windows.registry.printkey`     | 在配置单元或特定键值下列出注册表项                    |
| `windows.registry.userassist`   | 打印用户助手注册表项和信息                            |
| `windows.ssdt`                  | 列出系统调用表                                        |
| `windows.strings`               | 读取字符串命令的输出，并指示每个字符串属于哪个进程    |
| `windows.svcscan`               | 扫描 Windows 服务                                     |
| `windows.symlinkscan`           | 扫描 Windows 内存映像中存在的链接                     |

#### PART 3.2.2 通用与 Linux 插件

| 插件                  | 说明                                           |
| --------------------- | ---------------------------------------------- |
| `layerwriter`         | 运行 automagics 并将堆叠器生成的主层写出到文件 |
| `linux.bash`          | 从内存中恢复 bash 命令历史记录                 |
| `linux.check_afinfo`  | 验证网络协议的操作功能指针                     |
| `linux.check_syscall` | 检查系统调用表中的挂钩                         |
| `linux.elfs`          | 列出所有进程的所有内存映射 ELF 文件            |
| `linux.lsmod`         | 列出加载的内核模块                             |
| `linux.lsof`          | 列出所有进程的所有内存映射                     |
| `linux.malfind`       | 列出可能包含注入代码的进程内存范围             |
| `linux.proc`          | 列出所有进程的所有内存映射                     |
| `linux.pslist`        | 列出 Linux 内存映像中存在的进程                |
| `linux.pstree`        | 列出进程树                                     |

#### PART 3.2.3 macOS 插件

| 插件                   | 说明                                                 |
| ---------------------- | ---------------------------------------------------- |
| `mac.bash`             | 从内存中恢复 bash 命令历史记录                       |
| `mac.check_syscall`    | 检查系统调用表中的挂钩                               |
| `mac.check_sysctl`     | 检查 sysctl 处理程序的挂钩                           |
| `mac.check_trap_table` | 检查 trap 表中的挂钩                                 |
| `mac.ifconfig`         | 列出网卡信息                                         |
| `mac.lsmod`            | 列出加载的内核模块                                   |
| `mac.lsof`             | 列出所有进程的所有内存映射                           |
| `mac.malfind`          | 列出可能包含注入代码的进程内存范围                   |
| `mac.netstat`          | 列出所有进程的所有网络连接                           |
| `mac.psaux`            | 恢复程序命令行参数                                   |
| `mac.pslist`           | 列出 Mac 内存映像中存在的进程                        |
| `mac.pstree`           | 列出进程树                                           |
| `mac.tasks`            | 列出 Mac 内存映像中存在的进程（通过 tasks 队列遍历） |

## PART 4 使用案例

检材：[DIDCTF]电子取证初学 内存取证部分

> 这题的检材基址vol3识别有点问题 用`-c`手动改一下基址
> 文件路径改成自己电脑的
> 当然直接用vol2可能会好一些 可能是Win7镜像的原因

```JSON
{
  "dump": false,
  "kernel.class": "volatility3.framework.contexts.Module",
  "kernel.layer_name.class": "volatility3.framework.layers.intel.WindowsIntel32e",
  "kernel.layer_name.kernel_virtual_offset": 18446735277681938432,
  "kernel.layer_name.memory_layer.class": "volatility3.framework.layers.physical.FileLayer",
  "kernel.layer_name.memory_layer.location": "file:///E:/Forensics/file/DIDCTF/%E7%94%B5%E5%AD%90%E5%8F%96%E8%AF%81%E5%88%9D%E5%AD%A6/%E7%94%B5%E5%AD%90%E5%8F%96%E8%AF%81%E5%88%9D%E5%AD%A6/%E5%86%85%E5%AD%98%E5%8F%96%E8%AF%81%E6%A3%80%E6%9D%90/memdump.mem",
  "kernel.layer_name.page_map_offset": 1601536,
  "kernel.layer_name.swap_layers": true,
  "kernel.layer_name.swap_layers.number_of_elements": 0,
  "kernel.offset": 18446735277681938432,
  "kernel.symbol_table_name.class": "volatility3.framework.symbols.windows.WindowsKernelIntermedSymbols",
  "kernel.symbol_table_name.isf_url": "file:///E:/Forensics/tools/Volatility3/symbols/windows/ntkrnlmp.pdb/ECE191A20CFF4465AE46DF96C2263845-1.json.xz",
  "kernel.symbol_table_name.symbol_mask": 0,
  "physical": false,
  "pid": [],
  "timeliner": false
}

```

### PART 4.1 请给出计算机内存创建北京时间？

[答案格式：2000-01-11 00:00:00]

内存创建时间 已知镜像文件是windows镜像 所以采用插件 `windows.info`

得到回显

![图片.png](图片/图片%203.png)

SystemTime即为内存创建时间 可以看到是 `2023-06-20 17:02:27`

修正时区为北京时间需要+8小时 所以答案是 `2023-06-21 1:02:27`

### PART 4.2 请给出计算机内用户yang88的开机密码？

[答案格式：abc.123]

需要密码 我们需要NTML密码哈希 利用`windows.hashdump`插件

![图片.png](图片/图片%204.png)

取得NTML哈希为 `46e5597f00c98ae6cf3917b07bcc00be`

利用[在线网站](https://hashes.com/zh/decrypt/hash)解哈希

![图片.png](图片/图片.png)

取得密码为 `3w.qax.com`

### PART 4.3 提取内存镜像中的USB设备信息，给出该USB设备的最后连接北京时间？

[答案格式：2000-01-11 00:00:00]

USB设备的连接时间 我们可以去查注册表的USBSTOR

![图片.png](图片/图片%2010.png)

看`Last Write Time` 发现是 `2023-06-20 17:01:25`

按北京时间修正时区 答案是 `2023-06-21 01:01:25`

### PART 4.4 请给出用户yang88的LMHASH值？

[答案格式：字母小写]

之前找开机密码的时候用 `windows.hashdump` 已经出来了

![图片.png](图片/图片%206.png)

LMHASH为 `aad3b435b51404eeaad3b435b51404ee`

### PART 4.5 请给出用户yang88访问过文件“提现记录.xlsx”的北京时间？

[答案格式：2000-01-11 00:00:00]

需要访问文件的时间 可以查询NTFS 主文件表（MFT） 看他的元数据

用到的插件是 `windows.mftsacn`

注意 `windows.mftsacn` 是父插件 有三个子插件

需要标注使用的子插件才可以正常使用

- `windows.mftscan.MFTScan`
  - 主插件 用于扫描内存中残留的 MFT 记录 并输出文件的元数据

- `windows.mftscan.ADS`
  - 专门扫描 NTFS 的备用数据流（Alternate Data Streams） 用于检测隐藏数据

- `windows.mftscan.ResidentData`
  - 提取存储在 MFT 记录内部的驻留数据（小文件的内容）

数据量较大 用 `> 1.txt` 重定向结果到txt文件里

![图片.png](图片/图片%208.png)

> 这个报错是gbk的问题 暂时不用管

![图片.png](图片/图片%2012.png)

根据题目 找`提现记录.xlsx` 我们直接查找字符串`xlsx`

![图片.png](图片/图片%2014.png)

发现只有这两个结果 文件名是乱码 猜测是gbk的问题 不用管

时间为 `2023-06-20 16:59:32`

修正时区+8得到 `2023-06-21 00:59:32`

发现不对 经过查询 可能是因为这是win7镜像 vol3会有点问题

用vol2试试

![图片.png](图片/图片%205.png)

查找xlsx

![图片.png](图片/图片%2011.png)

得到时间 `2023-06-20 16:29:16`

修复时区为 `2023-06-21 00:29:16`

### PART 4.6 请给出“VeraCrypt”最后一次执行的北京时间？

[答案格式：2000-01-11 00:00:00]

需要取得最后的执行时间 我们需要查看进程

利用插件 `windows.psscan`

![图片.png](图片/图片%207.png)

查找字符 `Vera`

![图片.png](图片/图片%2013.png)

取得时间为 `2023-06-20 16:47:41`

修正时区为 `2023-06-21 00:47:41`

### PART 4.7 用户在“2023-06-20 16:56:57 UTC+0”访问过“维斯塔斯”后台多少 次？

[答案格式:10]

通过查询 得知“维斯塔斯”后台是web网页形式存在的

所以需要查浏览器历史记录 vol没法直接查 可以选择vol2导出数据库文件 然后数据库文件分析

但是太麻烦 我说用MemProcFS直接mount再查数据库 这里就不写了

得到count是 `2`

### PART 4.8 请给出用户最后一次访问chrome浏览器的进程PID？

[答案格式：1234]

查进程PID 刚刚用插件`windows.psscan`已经可以查了

![图片.png](图片/图片%202.png)

查找字符串chrome

![图片.png](图片/图片%209.png)

8个进程 看时间 最迟的是 `2023-06-20 16:56:51` 对应的序号为 `2456`
