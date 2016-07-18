# bdsm-slave-register [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

POC BDSM Slave Register

### Heroku Local for Development (Instructions assume you using a flavor of unix (linux/bsd and mac)

*    Install git from https://git-scm.com/downloads
*    Create a heroku account at https://signup.heroku.com
*    Go to https://dashboard.heroku.com/apps
*    Press New/Create new app
*    On App Name, type a name
*    Click Create App button
*    Click on Resources tab
*    Click on Find more add-ons button
*    Scroll down until you see mLab MondoDB, press on that one
*    Click on Login to Install, a small screen will popup and select the application name you create, follow the screen make sure to select Free/Sanbox
*    The mLab interface should give you a mongodb: url, it url may look like this mongodb://username:password@ds025469.mlab.com:25469/dbname
*    Change the username, password and dbname to your own.
*    Go back to https://dashboard.heroku.com/apps/[APPNAME]/deploy/heroku-git #change [APPNAME] to your app
*    Scroll a bit until you see Deploy using Heroku Git, install heroku toolbelt from https://toolbelt.heroku.com/
```
heroku login #use the credentials use when creating the account above.
heroku git:clone -a [APPNAME]
cd [APPNAME]
./localenv [APPNAME]
heroku local  #app will run locally on http://localhost:5000
```
or
```
git push heroku master
```

[travis-image]: https://travis-ci.org/TBSR/bdsm-slave-register.svg?branch=master
[travis-url]: https://travis-ci.org/TBSR/bdsm-slave-register
[daviddm-image]: https://david-dm.org/TBSR/bdsm-slave-register.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/TBSR/bdsm-slave-register
