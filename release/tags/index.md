---
layout: main
title: "Tags & Categories"
excerpt: "Tags!"
linkto: "release"
---
<ul>
{% capture site_tags %}{% for tag in site.tags %}{{ tag | first }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
{% assign tags_list = site_tags | split:',' | sort %}

<ul class="entry-meta inline-list">
	<li>| 
  {% for item in (0..site.tags.size) %}{% unless forloop.last %}
	{% capture this_word %}{{ tags_list[item] | strip_newlines }}{% endcapture %}
	<a href="#{{ this_word }}" class="tag"><span class="term">{{ this_word }}</span>: <span class="count">{{ site.tags[this_word].size }}</span></a> | 
  {% endunless %}{% endfor %}
  </li>
</ul>

{% for item in (0..site.tags.size) %}{% unless forloop.last %}
  {% capture this_word %}{{ tags_list[item] | strip_newlines }}{% endcapture %}
	<li>
	<h2 id="{{ this_word }}">{{ this_word }}:</h2>
		<ul>
	{% for post in site.tags[this_word] %}{% if post.title != null %}
	  <li><a href="{{ site.url }}{{ post.url }}" title='{{ post.title }}'>{{ post.title }}</a></li>
	{% endif %}{% endfor %}
		</ul>
	</li><!-- /.hentry -->
{% endunless %}{% endfor %}
</ul>