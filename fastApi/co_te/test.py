n = int(input())

result = 0

for i in range(n):
    a, b = map(str, input().split())
    if(a == "deposit"):
        result += int(b)
    elif(a == "pay" and result >= int(b)):
        result -= int(b)

print(result)