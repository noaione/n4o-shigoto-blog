#usr/bin/python 2
from urllib import urlopen #URL parsing
import argparse #Argumen
import random

arg_parser = argparse.ArgumentParser() #Argumen awal untuk nanya
arg_parser.add_argument("-i",
                       "--input",
                       dest="berkas",
                       action="store",
                       default=None,
                        required=True,
                        help="ID PerpusIndo (perpusindo.info/berkas/*idberkas*)")
args = arg_parser.parse_args()

pi = 'http://perpusindo.info/berkas/'+ args.berkas #proses argumen dengan link

try:
	an = 1
	while True: #looping
		an += 1
		proses = urlopen(pi) #proses pembukaan url (intinya buat nambah xp aja) lewatin ini dah dapet xp
		x = random.randint(1,3) #Cuma random shit doang awkwkkw (belom tentu bener)
		for delete in range (1):
			print"Tambah",x,"XP","  (Kayaknya)" #Output asal-asalan dari angka 1-3 yang di random
except KeyboardInterrupt: #Interruption dari User (biar halus)
	print('Proses Terganggu! Menghentikan Proses!')
