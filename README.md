# Nutritionix
Nutrition from the Cloud


#Git Flow
Please develop new features in the separate feature branches. 
Submit pull requests to have the changes merged.
Changes to the master branch of the MattSilvLLC repo will deploy directly to the www.nutritionix.com

Before any pull requests:
```
git pull --rebase
git push
```

Pull requests should be in the format of
`(feat) This is a request. Fixes #243`

#Running the app locally

Generally speaking, to run app locally you simply need:
`npm install` from root directory

Make sure you have node installed. npm install is rewritten in package.json. It will also install any bower dependencies.

Back at project root, run:

`npm install -g gulp`

if you do not already have gulp.

at root run:
`npm install`

Open a new tab and run:
`gulp develop`
This will watch for any changes made to any client side javascript and scss files and recompile the single js or css file.
It will also run nodemon subprocess which will watch server code and restart server on changes.

#Adding more dependencies and modules
Don't forget to use `--save` to add packages to the bower.json or package.json file.
cd into client to install bower components. We do not use a .bowerrc file. Feel free to make one.
similarly, cd into server to npm install server related package files.

#Tests and Linters.
Always run before pull requests.

Install eslint:
```
npm install -g eslint
```
at root run `eslint .`

