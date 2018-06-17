import psycopg2

try:
	conn=psycopg2.connect(database="dristidb", user="postgres", password="admin", port=5433)
	print("connected")
except:
	print("unable to connect")


cursor1 = conn.cursor()
cursor2 = conn.cursor()
cursor1.execute("SELECT id FROM userlist")
cursor2.execute("SELECT name FROM userlist")
register1 = cursor1.fetchall()
register2=cursor2.fetchall()
name_list=[]
id_list=[]
print(register1)
print(register2)
for i in register1:
	#print(list(i).pop())
	id_list.append(list(i).pop())

for a in register2:
    ai = a[-1].strip()
    name_list.append(ai)


print(name_list)
print(id_list)

pointer=id_list.index(21)
print(name_list[pointer])