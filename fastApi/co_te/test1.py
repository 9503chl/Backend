code = "000000"

stack = ["000000"]

L = int(input())

for i in range(L):
    code = input()
    
    if(stack.__contains__(code)):
        print("Yes")
    else:
        print("No")
        stack.append(code)
