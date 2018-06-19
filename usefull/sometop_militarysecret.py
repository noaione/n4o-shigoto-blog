from bs4 import BeautifulSoup
import asyncio
import requests
import re
import wget
import os, sys
import discord
from discord.ext import commands
import subprocess


def getThumbnail(link, listVer=True):
	if listVer:
		string = str(link)
		num1 = string.find('data-src="')
		string2 = string[num1:][10:]
		num2 = string2.find('" height')
		return string2[:num2]
	else:
		link = link.find( 'div', attrs={ 'id' : 'cover' })
		str1 = link.find( 'img', attrs={ 'class' : '' })
		str1 = str(str1)
		print(str1)
		num1 = str1.find('src="')
		str2 = str1[num1:][5:]
		num2 = str2.find('" width')
		return str2[:num2]

def getMetadata_Homepage(url, number):
	"""Please use parsed version from beautifulsoup4"""
	number = number - 1
	if number == -1:
		number = 0
	find1 = url.find( 'div', attrs={ 'class' : 'container index-container' })
	find2 = find1.find_all('a', class_='cover')
	parsed = find2[number]
	img = getThumbnail(parsed, True)
	title = parsed.text
	link = 'https://nhentai.org{}'.format(parsed["href"])
	nuclearCode = parsed["href"]
	nuclearCode = nuclearCode[3:][:-1]
	metadataHome = {'title': title, 'img': img, 'link': link, 'code': nuclearCode,'number': number}
	return metadataHome

def loadPages(url):
	r = requests.get(url)
	r = r.text
	parsed_bs4 = BeautifulSoup(r, 'html.parser')
	return parsed_bs4

def getTags(url):
	"""Please use parsed version from beautifulsoup4"""
	parsed_bs4 = loadPages(url)
	find1 = parsed_bs4.find( 'section', attrs={ 'id' : 'tags' })
	find2 = find1.find_all('div', class_='tag-container field-name ')
	find3 = parsed_bs4.find( 'div', attrs={ 'id' : 'info' })
	timePosted = find3.find_all('time')
	timePosted = timePosted[0].text
	pagesOpen = '{}1'.format(url)
	getPages1 = loadPages(pagesOpen)
	pagesNum = getPages1.find('span', attrs={'class': 'num-pages'})
	pagesNum = int(pagesNum.text)
	final = []
	for item in find2:
		finishedtitle = item.text.replace('\t','')[1:][:-1].replace(':\n', '**:\n')
		title1 = re.sub("[\(\[].*?[\)\]]", "", finishedtitle)
		title1 = '**{}'.format(title1)
		final.append(title1)
	final.insert(0, timePosted)
	final.insert(0, pagesNum)
	final.insert(0, getThumbnail(parsed_bs4, False))
	return final

def getTitle(url):
	parsed_bs4 = loadPages(url)
	find1 = parsed_bs4.find( 'div', attrs={ 'id' : 'info' })
	title = find1.find('h1')
	return title.text

def downloadDoujin(nuclearcode):
	print('Initiating Download...')
	if 'nhentai.net' in nuclearcode:
		link = nuclearcode
	else:
		link = 'https://nhentai.net/g/{}'.format(nuclearcode)
	tags = getTags(link)
	totalImg = tags[1]
	imgNumber = 1
	folderName = getTitle(link)
	link = '{}1'.format(link)
	parsedOne = loadPages(link)
	fileloc = '{}\\{}'.format(os.path.dirname(os.path.realpath(__file__)), folderName)
	find1 = parsedOne.find( 'section', attrs={ 'id' : 'image-container' })
	find1 = str(find1)
	num1 = find1.find('src')
	find1 = find1[num1:][5:]
	num2 = find1.find('" width')
	find2 = find1[:num2]
	if 'png' in find2:
		imgFmt = 'png'
	if 'jpg' in find2:
		imgFmt = 'jpg'
	find2 = find2[:-5]
	print('Download initiated. Starting...')
	try:
		while True:
			if imgNumber == totalImg:
				print('Finished downloading all of them')
				break
			consLink = '{}{}.{}'.format(find2, imgNumber, imgFmt)
			filename = wget.detect_filename(consLink)
			consLocation = '{}\\{}'.format(fileloc, filename)
			print('Downloading {} out of {}'.format(imgNumber, totalImg))
			wget.download(url=consLink, out=consLocation) 
		print('Now compiling all the files...')
		makePdf(folderName, fileloc)
		print('Finished compiling')
		finalPDF = '{}\\{}.pdf'.format(os.path.dirname(os.path.realpath(__file__)), folderName)
		return False, finalPDF
	except Exception:
		return True, 'null'

def makePdf(pdfFileName, dir = ''):
	from fpdf import FPDF
	from PIL import Image
	from os import listdir
	from os.path import isfile, join

	if (dir):
		dir += "/"

	filelist = [f for f in listdir(dir) if isfile(join(dir, f))]

	cover = Image.open(dir + str(filelist[0]))
	width, height = cover.size

	pdf = FPDF(unit = "pt", format = [width, height])

	for page in filelist:
		pdf.add_page()
		pdf.image(dir + str(page), 0, 0)

	pdf.output(pdfFileName + ".pdf", "F")

def searchDoujin(query, number=1):
	number = number - 1
	if number == -1:
		number = 0
	query = query.replace(' ', '+')
	baseURL = 'https://nhentai.net/search/?q={}'.format(query)
	parsed = loadPages(baseURL)
	metaList = getMetadata_Homepage(parsed, number)
	totalDoujin = parsed.find('h2')
	totalDoujin = str(totalDoujin.text)
	findTotalDo = totalDoujin.find(' Results')
	totalDoujin = totalDoujin[:findTotalDo]
	title = metaList['title']
	thumbnail = metaList['img']
	urlTags = metaList['link']
	code = metaList['code']
	tags = getTags(urlTags)
	totalPages = str(tags[1])
	timePosted = str(tags[2])
	num = 3
	totalNum = len(tags)
	bodyTags = ''
	while num < totalNum:
		bodyTags = bodyTags + '{}\n'.format(tags[num])
		num +=1
	final = {'title': title, 'body': bodyTags, 'url': urlTags, 'footer': timePosted, 'totalPages': totalPages, 'thumbnail': thumbnail, 'code': code, 'totalDoujin': totalDoujin}
	return final

description = """
Bot nhentai untuk discord yang dirakit oleh N4O#3775
"""

bot = commands.Bot(commands.when_mentioned_or('n.'), description=description)

@bot.event
async def on_ready():
	print('Connected.')
	presence = 'Membaca Doujin || Ketik n.help untuk bantuan'
	await bot.change_presence(game=discord.Game(name=presence))
	print('---------------------------------------------------------------')
	print('Logged in as:')
	print('Bot name: ' + bot.user.name)
	print('With Client ID: ' + bot.user.id)
	print('---------------------------------------------------------------')

@bot.group(pass_context=True)
async def nhentai(ctx):
	"""Doujin initiator"""
	if ctx.invoked_subcommand is None:
		bot.say('**Perintah untuk nhentai**\n**?nhentai search <query>** -- Mencari sesuatu di nhentai\n**?nhentai download <id>** -- Mendownload doujin dari nhentai dengan kode nuklir')

@nhentai.command(pass_context=True)
async def search(ctx, *, title, number=1):
	"""Mencari doujin yang anda mau."""
	init = searchDoujin(title, 1)
	if type(init) is str:
		await bot.say(init)
		return 'No result'
	else:
		pass

	maxPage = int(init['totalDoujin'])
	firstRun = True
	while True:
		if firstRun:
			firstRun = False
			num = 1
			find = searchDoujin(title, num)
			embed=discord.Embed(title="Doujin Info", url=find['url'], color=0x81e28d)
			embed.set_image(url=find['thumbnail'])
			embed.add_field(name='Judul', value=find['title'], inline=False)
			embed.add_field(name='Informasi Doujin', value=find['body'], inline=True)
			embed.add_field(name='Total Halaman', value='{} halaman'.format(find['totalPages']), inline=True)
			fmtFooter = 'Kode nuklir: {} || {}'.format(find['code'], find['footer'])
			embed.set_footer(text=fmtFooter)
			msg = await bot.say(embed=embed)
	
		if maxPage == 1 and num == 1:
			toReact = ['✅']
		elif num == 1:
			toReact = ['⏩', '✅']
		elif num == maxPage:
			toReact = ['⏪', '✅']
		elif num > 1 and num < maxPage:
			toReact = ['⏪', '⏩', '✅']
		for reaction in toReact:
			await bot.add_reaction(msg, reaction)
		#feel free to change ✅ to 🆗 or the opposite
		def checkReaction(reaction, user):
			e = str(reaction.emoji)
			return e.startswith(('⏪', '⏩', '✅'))

		res = await bot.wait_for_reaction(message=msg, user=ctx.message.author, timeout=10, check=checkReaction)
		if res is None:
			await bot.delete_message(ctx.message)
			await bot.delete_message(msg)
			break
		elif '⏪' in str(res.reaction.emoji):
			num = num - 1
			find = searchDoujin(title, num)
			embed=discord.Embed(title="Doujin Info", url=find['url'], color=0x81e28d)
			embed.set_image(url=find['thumbnail'])
			embed.add_field(name='Judul', value=find['title'], inline=False)
			embed.add_field(name='Informasi Doujin', value=find['body'], inline=True)
			embed.add_field(name='Total Halaman', value='{} halaman'.format(find['totalPages']), inline=True)
			fmtFooter = 'Kode nuklir: {} || {}'.format(find['code'], find['footer'])
			embed.set_footer(text=fmtFooter)
			await bot.delete_message(msg)
			msg = await bot.say(embed=embed)
		elif '⏩' in str(res.reaction.emoji):
			num = num + 1
			find = searchDoujin(title, num)
			embed=discord.Embed(title="Doujin Info", url=find['url'], color=0x81e28d)
			embed.set_image(url=find['thumbnail'])
			embed.add_field(name='Judul', value=find['title'], inline=False)
			embed.add_field(name='Informasi Doujin', value=find['body'], inline=True)
			embed.add_field(name='Total Halaman', value='{} halaman'.format(find['totalPages']), inline=True)
			fmtFooter = 'Kode nuklir: {} || {}'.format(find['code'], find['footer'])
			embed.set_footer(text=fmtFooter)
			await bot.delete_message(msg)
			msg = await bot.say(embed=embed)
		elif '✅' in str(res.reaction.emoji):
			await bot.delete_message(ctx.message)
			await bot.delete_message(msg)
			break

@nhentai.command(pass_context=True)
async def download(ctx, kodeAtauURL):
	"""Download doujin dengan kode nuklir maupun url anda"""
	errors, fileloc = downloadDoujin(kodeAtauURL)
	if errors:
		bot.say('Terjadi kesalahan dalam proses mendownload')
		return
	else:
		try:
			subprocess.call('rclone copy "{}" nao:"RDP_BOT\\Doujinshi"'.format(fileloc), shell=True)
			bot.say('Sukses mengupload file, ini dia filenya\ngoogledrive.akmj')
		except Exception:
			bot.say('Gagal mengupload file')

@bot.command(pass_context=True)
async def reinkarnasi(ctx):
	try:
		await bot.say(":sparkles: Proses Reinkarnasi Dimulai...")
		print('!!!! Memulai proses')
		bot.logout()
		bot.close()
		print('### Connection closed')
		os.execv(sys.executable, ['python'] + sys.argv)
	except commands.CheckFailure:
		await bot.say("Kamu tidak bisa menjalankan perintah ini\n**Alasan:** Bukan Owner Bot")

@bot.command(pass_context=True)
async def bundir(ctx):
	try:
		await bot.say(":sparkles: Proses Reinkarnasi Dimulai...")
		print('!!!! Memulai proses')
		bot.logout()
		bot.close()
		print('### Connection closed')
		sys.exit(0)
	except commands.CheckFailure:
		await bot.say("Kamu tidak bisa menjalankan perintah ini\n**Alasan:** Bukan Owner Bot")

bot.run('NDU1ODE2OTc2MDcwMDgyNTcy.DgBgKA.v1oWMVAs97aLo49YiJ5rv-5y8N8')

