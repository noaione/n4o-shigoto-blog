---
layout: main
title: "Releases"
excerpt: "All N4O Release (Semua hutang yang dirilis N4O)"
linkto: "tags"
---
<h2>BDMV:</h2>
<ul>
{% for post in site.posts %}
	{% if post.site_name == "BDMV" %}
	<li><a href="{{ post.url }}" class="waves-effect">{{ post.title }}</a></li>
	{% endif %}
{% endfor %}
</ul>

<h2>Personal Release:</h2>
<ul>
{% for post in site.posts %}
	{% if post.site_name == "Release" %}
	<li><a href="{{ post.url }}" class="waves-effect">{{ post.title }}</a></li>
	{% endif %}
{% endfor %}
</ul>

<h2>Unimportant stuff:</h2>
<ul>
	<li><a href="https://github.com/noaione/mpv-discordRPC" class="waves-effect">mpv media player integration with Discord Rich Presence</a></li>
	<li><a href="https://github.com/noaione/n4ofunc" class="waves-effect">VapourSynth Function</a></li>
	<li><a href="https://github.com/noaione/yuu" class="waves-effect">yuu - A simple AbemaTV video downloader</a></li>
</ul>