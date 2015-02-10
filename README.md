# gizmo - the stupid http object store 

http - because ports 80 and 443 are almost always open on any firewall.

should care about implementation to get use out of gizmo.

- can dynamically grow and shrink without any issues.

0123
4567
89ab
cdef

- one node single copy
- two nodes, all the data is duplicated on both nodes
- three nodes, ...
- 4 nodes, ...
- assume half the nodes can go down at any time

focus on simplicity and must be lightweight. 
an personal object stroe.
minimal implementation to allow others to customize.
self-hosted: its always cheaper, more flexible
different persistence backends
  - file system (default)
  - mongodb
  - amazon s3
  - add you own adapter

Works well will all object sizes, only things that keeps you from
dumping objects in your store is file/network io. Keep push more
content until your hard drive is full.

- meant to be an installable module from npm
- cross platform cli/server

# server

gizmod - start the gizmod server
- will have initialization questions

# sync


# clients

gizmo get <hash>

gizmo login
- login to a gizmo server
- save token

gizmo put <name>
- put a stream to gizmod
- no automatic metadata collection
- explicit metadata

gizmo put:file <name>
- put file to gizmod
- display progress bar
- default file metadata

gizmo list
- list all items from gizmod

gizmo describe <item>
- show items about a object

gizmo archive <dir>
- quickly put dir on gizmod
- tar and zip dir
- put to server

# types

- there are many default types
- can add own custom types

# security

- everything is private by default
- can have public objects, no auth required

# web ui

gizmo ui - launch default browser with gizmo

- the web ui lists all the objects in your store
- everything is searchable
  - searches are live, updates to the store trigger ui updates
    after seach is rerun
- certain object types will be accessible differently
  - text files will be rendered as themselves
    - code is highlighted
    - html/css/js can be served, think hosting
  - music will have a player
  - images/video will have thumbnails
  - 

# importing

import is a very useful feature when first getting started

gizmo import

gizmo import:web
- save a web page

gizmo import:youtube
- import videos from youtube
- save them for later in case the get removed
- audio only mode

gizmo import:video
- generate thumbnail for web ui
- add video specific metadata
- scape metadata from online
- make sure the video is a stream-able format
- convert to stream-able format

gizmo import:audio
- get album art for web ui
- scape metadata

gizmo import:images
- generate thumbnails for web ui

gizmo import:pdf
- generate preview for web ui

# searching

- key:value search syntax
- auto page results

gizmo search 
