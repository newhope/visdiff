# Visdiff

Spot different between 2 website snapshots

## Install
- Clone this repository
- `cd` to this repository
- Run `npm link` or `yarn link` to install and link the library.

## Usages

```
cd my-project
visdiff make-config
# ... make changes on the config file ".visdiff.js"
visdiff capture ABC # capture as name "ABC"
# ... do changes on the code ...
visdiff capture XYZ # capture as name "XYZ"
visdiff compare ABC XYZ # compare snapshot "ABC" and "XYZ"
# you'll see a report html file for what's changes
# cmd+click (double click) to the file in console to open it in your browser.

```

## Configurations

Configuration file in the current directory.

I'm too lazy to document it out, a detail note have been put in the config template, just run `visdiff make-config lazy.js` and check the `lazy.js` file please.

## Commands

### make-config
Copy the sample config template into current directory
#### Parameters
- config-name (string) - Optional - Config file name

#### Samples
> `visdiff make-config`

Make a config file named `.visdiff.js` into current directory

> `visdiff make-config my-conf.js`

Make a config file named `my-conf.js` into current directory


### capture
Start capturing the website base on the current configurations.

#### Parameters
- capture-name (string) - *Compulsory* - Name of the capture. *Don't use silly characters that mess with the file system*, dash/lodash/dot is allowed.

#### Samples
> `visdiff capture the-first`


### compare
Compare 2 snapshots

#### Parameters
- capture-name-1 (string) - *Compulsory* - Name of the first capture to compare.
- capture-name-2 (string) - *Compulsory* - Name of the second capture to compare.

#### Samples:
> `visdiff compare the-first the-last`


### delete-all/clear-all
Clear all snapshots &amp; reports from the project.

Will

#### Samples
> `visdiff clear-all` 
 
