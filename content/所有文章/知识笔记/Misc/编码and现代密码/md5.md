# MD5

MD5（_Message-Digest Algorithm 5_）是一种密码学哈希函数  
用于将任意长度的数据计算成一个固定的128bit即32位十六进制的数

特征有

- 无论输入多大，输出永远是一个 128bit 的哈希值
- 输入即使只改变一个比特，输出的哈希值也会发生剧烈变化
- 从哈希值理论上无法反推出原始输入
- 难以找到两个不同的输入产生相同的哈希输出

用 Python 实现一下

```
import hashlib

def md5_32(s: str) -> str:
    return hashlib.md5(s.encode('utf-8')).hexdigest()

if __name__ == "__main__":
    str = ""
    print(md5_32(str))
```
