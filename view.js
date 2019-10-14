const fs = require('fs-extra');
const path = require('path');
let newPath = __dirname;
// const konva = require('konva');

// ipc render part
const electron = require('electron');
const {ipcRenderer} = electron;

// const rootDir = fs.readdirSync("C:\\")

// function printRoot() {
//     // let str = '';
//     rootDir.forEach(function(file) {
//         // str+= '<p>' + file + '</p>';
//         let p = document.createElement("p");
//         p.textContent = file;
//         document.getElementById("rootUL").appendChild(p);
//     })
//     // document.getElementById("files").innerHTML = str;
// }
// printRoot();

let width = 2000;
    let height = 1000;

let stage = new Konva.Stage({

    container: 'container',
    width: width,
    height: height,
});
printContents();
goBackDirectory();
goIntoDirectory();


function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    // get num of sources
    for (var src in sources) {
        numImages++;
    }
    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

function printContents() {

    var sources = {
        dirt: './images/background/dirt.png',
        grass1: './images/background/grass1.png',
        milkPail: './images/milkpail.png',
        wateringCan: './images/wateringcan.png',
        trash: './images/trash.png',
        copy: './images/copy.png',
        cow: './images/cow.png',
        cart: './images/move.png',
        book: './images/book.png'
    }

    loadImages(sources, function(images) { // finishes sources then callback?
        console.log('hi!');
        start(images);
    })
}
function start(images) {

    let layer = new Konva.Layer();
    let deleteArray = [];

    setBackground(layer, images);
    var trash, copy, move, info;
    trashCartCopyIcons(layer, images, trash, copy, move, info, deleteArray);

    stage.add(layer);

    // prints out all files
    fs.readdir(newPath, function (err, files) {
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }

        let i = 65;
        let j = 60;

        // array of random crops! 
        let cropVariety = ['cauliflower.png', 'cropBlueberry.png', 'cropCorn.png', 'cropMelon.png', 'cropPumpkin.png', 'cropStrawberry.png'];
        // let cropVariety = [images.cauliflower, images.cropBlueberry, images.cropCorn, images.cropMelon, images.cropPumpkin, images.cropStrawberry]

        var group;
        files.forEach(function(file) {
            if (i > 590) {
                i = 65;
                j += 60;
            }

            // if it is a directory (specify with **)
            if (fs.statSync(file).isDirectory()) {
                let isFolder = true;
                makeGroup(i, j, isFolder, cropVariety, layer, group, file, deleteArray);
            }
            else {
                let isFolder = false;
                makeGroup(i, j, isFolder, cropVariety, layer, group, file, deleteArray);
                
            }
            i +=45;
        })
    });
}
function makeGroup(i, j, isFolder, cropVariety, layer, group, file, deleteArray) {
    // start loading image    
    group = new Konva.Group({
        x: i,
        y: j,
        draggable: true,
    });

    let text = new Konva.Text({
        x: i,
        y: j + 65,
        text: file,
        // name: file,
        fontSize: 16,
        width: 80,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'white',
    });
    group.add(text);

    let imageObj = new Image();
    imageObj.onload = function() {
        console.log('hhhhhh')
        if (isFolder) {
            group.name('folderFarm ' + file);
        } else {
            group.name('fileFarm ' + file);
        }                                
        
        let crop = new Konva.Image({
            x: i, 
            y: j,
            // image: cropVariety[Math.floor(Math.random() * 6)],
            image: imageObj,
            width: 60,
            height: 65,
            opacity: 1,
        })

        group.add(crop);
        layer.add(group);

        stage.add(layer);
    }
    if(isFolder) {
        imageObj.src = './images/cow.png';
    } else {
        imageObj.src = './images/' + cropVariety[Math.floor(Math.random() * 6)];
    }
    selectGroupDelete(group, deleteArray);
    goIntoDirectory(group, layer);
}
function setBackground(layer, images) {

    // set background
    let grassBackground = new Konva.Rect({
        x:0,
        y:0,
        width: width, 
        height: height,
        fillPatternImage: images.grass1,
    })

    layer.add(grassBackground);


    // set farm
    for (let i = 100; i < 1200; i = i + 50) {
        for (let j = 100; j < 800; j = j + 50) {
            let farm = new Konva.Rect({
                x: i,
                y: j,
                width: 50,
                height: 50,
                fillPatternScaleX: 100,
                fillPatternScaleY: 100,
                fillPatternImage: images.dirt
            })
            layer.add(farm);
        }
    }

    let currDirectoryText = new Konva.Text({
        x: 100,
        y: 50,
        text: process.cwd(),
        // name: file,
        fontSize: 30,
        fontFamily: 'Calibri',
        fill: 'black',
    })

    layer.add(currDirectoryText);
}
function trashCartCopyIcons(layer, images, trash, copy, move, info, deleteArray) {
    // trash can
    console.log('trash');
    trash = new Konva.Image({
        x: 1300,
        y: 150,
        name: 'trash',
        image: images.trash,
        width: 60,
        height: 65
    });
    var trashText = new Konva.Text({
        x: 1300,
        y: 150 + 70,
        text: 'Trash',
        // name: file,
        fontSize: 16,
        width: 80,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })
    layer.add(trash);
    layer.add(trashText);

    copy = new Konva.Image({
        x: 1300,
        y: 565,
        image: images.copy,
        width: 60,
        height: 65,
    })

    var copyText = new Konva.Text({
        x: 1300,
        y: 565 + 70,
        text: 'Copy',
        // name: file,
        fontSize: 16,
        width: 80,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })

    layer.add(copy)
    layer.add(copyText)

    move = new Konva.Image({
        x: 1300,
        y: 275,
        image: images.cart,
        width: 70,
        height: 80,
    })

    var moveText = new Konva.Text({
        x: 1300,
        y: 275 + 80,
        text: 'Move',
        // name: file,
        fontSize: 16,
        width: 80,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })

    layer.add(move);
    layer.add(moveText);

    info = new Konva.Image({
        x: 1300,
        y: 415,
        image: images.book,
        width: 60,
        height: 65,
    })

    var infoText = new Konva.Text({
        x: 1300,
        y: 415 + 70,
        text: 'Crop Info',
        // name: file,
        fontSize: 16,
        width: 80,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })

    layer.add(info);
    layer.add(infoText);

    createFile = new Konva.Image({
        x: 1300,
        y: 700,
        image: images.wateringCan,
        width: 60,
        height: 65,
    })

    var createText = new Konva.Text({
        x: 1300,
        y: 700 + 70,
        text: 'Grow Crop',
        // name: file,
        fontSize: 16,
        width: 80,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })

    layer.add(createFile);
    layer.add(createText);

    

    trashDelete(layer, trash, deleteArray);
    copyFile(layer, copy, deleteArray);
    moveFile(layer, move, deleteArray);
    fileInformation(stage, info, deleteArray);
    createFileFolder(layer, createFile);
}

function selectGroupDelete(group, deleteArray) {

    // collect clicked on files/folders to delete
    group.on('click', function(evt) {
        console.log('asdfsdfa');
        let groupClick = evt.target.getParent();

        console.log('group click: ', groupClick)

        if (groupClick.findOne('Text').fill() === 'white') {
            groupClick.find('Text').fill('green');
            groupClick.find('Image').opacity(0.5);
            
            // push to array
            deleteArray.push(groupClick.name());
            console.log('deleteArray: ', deleteArray);


        } else if (groupClick.findOne('Text').fill() === 'green') {
            groupClick.find('Text').fill('white');
            groupClick.find('Image').opacity(1);

            // remove deselected item from array
            deleteArray.splice(deleteArray.indexOf(groupClick.name()), 1);
        }
        

        groupClick.getLayer().batchDraw();
    });
}

function trashDelete(layer, trash, deleteArray) {
    // delete collected files/folders
    trash.on('click', function(evt) {

        console.log('evt.target: ', evt.target);

        var actualGroup
        while(deleteArray.length !== 0) {

            // stores selected target to remove
            let fileDelete = "./";
            let fileName = deleteArray[0].substr(deleteArray[0].indexOf(' ') + 1);
            fileDelete += fileName
            console.log('fileDelete', fileDelete);

            let findGroups = layer.find('Group');
            for (let i = 0; i < findGroups.length; i++) {
                if (findGroups[i].findOne('Text').text() === fileName) {
                    console.log('text: ', fileName);
                    actualGroup = findGroups[i]
                }
                
            }

            // // if double clicked on delete file and delete child
            if (actualGroup.hasName('fileFarm')) {
                
                console.log('clicked on file!')
                // it is a file
                // remove actual file
                fs.unlink(fileDelete, (err) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    // file was removed
                })     
            }
            else if (actualGroup.hasName('folderFarm')) {
                console.log('clicked on folder')
                // if directory use remove to delete directory
                fs.remove(fileDelete, (err) => {
                    if (err) {
                        console.log("could not delete directory: " + err) 
                        return
                    }
                })  
            }
            // remove clicked text from UI
            actualGroup.remove()

            // remove from array
            deleteArray.shift();
            console.log(deleteArray);
            
            
        }
        layer.batchDraw();
        
    })
}

function goBackDirectory() {
    // go up a directory
    console.log('back');
    let button = document.querySelector("#goUP");
    button.addEventListener('click', function (event) {
        // go up a directory
        process.chdir("../")
        console.log(process.cwd());
        console.log('random');
        newPath = process.cwd();

        printContents();
        // printContents(path.join(__dirname))
    })
}

function goIntoDirectory(group, layer) {

    group.on('dblclick', function(evt) {
        var group = evt.target.getParent();
        console.log('You double clicked on ', group.name());

        let folderIn = "./";

        let substring = group.name().substr(group.name().indexOf(' ') + 1);
        folderIn += substring;
        console.log('folderIN: ', folderIn);
        
        // change to new directory
        process.chdir(folderIn);
        newPath = process.cwd();


        layer.destroy();
        printContents();
    })
}
function createFileFolder(layer, createFile) {

    createFile.on('click', function(evt) {

        ipcRenderer.send('createPopUp')

        ipcRenderer.on('file:add', function(e, file) {
            // const p = document.createElement('p');
            // const itemText = document.createTextNode(file);
            // p.appendChild(itemText);
    
            // // create actual file if it does not exist
            // fs.appendFile()
    
            console.log('file: ', file)
            if (file.indexOf(".") != -1) {
                fs.appendFile(file, '', function(err) {
                    if (err) throw err;
                    layer.destroy();
                    printContents();
                })
            } else {
                mkdirIfNotExists(file);
            }
            
        })

    })


    // create actual folder if it does not exist
    function checkIfDirectoryExists(file, successCallback, errorCallback) {
        try {
            if(fs.lstatSync.isDirectory()) {
                successCallback();
                alert("folder/file already exists!")
            }
        } catch (e) {
            errorCallback();
        }
    };

    function mkdirIfNotExists (file) {
        return new Promise(function(resolve, reject) {
            checkIfDirectoryExists(file, function() {
                resolve();
                console.log("OMG!")
                alert("folder/file already exists!")
            }, function() {
                fs.mkdirSync(file);
                // if folder successfully created output
                layer.destroy();
                printContents();
                resolve();
            })
        })
    }
}

function copyFile(layer, copy, deleteArray) {

    
    copy.on('click', function(evt) {

        console.log('copy array', deleteArray)
        let lastClicked = deleteArray.length-1;
        ipcRenderer.send('copyPopUp');
        let fileName = deleteArray[lastClicked].substr(deleteArray[lastClicked].indexOf(' ') + 1);
        console.log('newpath ', newPath);
        let src = newPath + '/' + fileName;


        ipcRenderer.on('file:copy', function(e, filePath) {
            dest = filePath + '/' + fileName;
            fs.copyFile(src, dest, (err) => {
                if (err) throw err;
                console.log('File was copied to destination');
              });
        })
        
    })
    
}
function moveFile(layer, move, deleteArray) {
    move.on('click', function(evt) {

        console.log('move array', deleteArray)
        let lastClicked = deleteArray.length-1;
        ipcRenderer.send('movePopUp');
        let fileName = deleteArray[lastClicked].substr(deleteArray[lastClicked].indexOf(' ') + 1);
        console.log('newpath ', newPath);
        let src = newPath + '/' + fileName;


        ipcRenderer.on('file:move', function(e, filePath) {
            dest = filePath + '/' + fileName;
            fs.copyFile(src, dest, (err) => {
                if (err) throw err;
                console.log('File was moved to destination');

                var actualGroup
                let fileDelete = "./";
                fileDelete += fileName
                console.log('fileDelete', fileDelete);

                let findGroups = layer.find('Group');
                for (let i = 0; i < findGroups.length; i++) {
                    if (findGroups[i].findOne('Text').text() === fileName) {
                        console.log('text: ', fileName);
                        actualGroup = findGroups[i]
                    }
                    
                }

                // // if double clicked on delete file and delete child
                if (actualGroup.hasName('fileFarm')) {
                    
                    console.log('clicked on file!')
                    // it is a file
                    // remove actual file
                    fs.unlink(fileDelete, (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        // file was removed
                    })     
                }
                else if (actualGroup.hasName('folderFarm')) {
                    console.log('clicked on folder')
                    // if directory use remove to delete directory
                    fs.remove(fileDelete, (err) => {
                        if (err) {
                            console.log("could not delete directory: " + err) 
                            return
                        }
                    })  
                }
                // remove clicked text from UI
                actualGroup.remove()

                // remove from array
                deleteArray.shift();
                console.log(deleteArray);

                layer.batchDraw();
            });
        })
    })
}
function fileInformation(stage, info, deleteArray) {

    let layer2 = new Konva.Layer();
    
    info.on('click', function(evt) {
        layer2.destroy();
        console.log('move array', deleteArray)
        let lastClicked = deleteArray.length-1;
        let fileName = deleteArray[lastClicked].substr(deleteArray[lastClicked].indexOf(' ') + 1);
        console.log('newpath ', newPath);
        let src = newPath + '/' + fileName;

        fs.stat(src, (err, stats) => {
            if (err) {
                console.error(err)
                return
            }

            let x = 1600;
            let y = 200;
            fileInfoDisplay(layer2, x, y, stats, src);

            // ipcRenderer.send('file:info', JSONfileInfo)
            // ipcRenderer.send('fileInfoPopUp')
        }) 

    })
}
function fileInfoDisplay(layer2, x, y, stats, src) {
    var size = new Konva.Text ({
        x: x,
        y: y,
        text: 'Size (bytes): ' + stats.size,
        // name: file,
        fontSize: 16,
        width: 80,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })
    layer2.add(size);

    var creationTime = new Konva.Text ({
        x: x,
        y: y + 60,
        text: 'Date Created: ' + stats.birthtime,
        // name: file,
        fontSize: 16,
        width: 200,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })
    layer2.add(creationTime);
    
    var lastMod = new Konva.Text ({
        x: x,
        y: y + 160,
        text: 'Last Modified: ' + stats.mtime,
        // name: file,
        fontSize: 16,
        width: 200,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })
    layer2.add(lastMod);

    var lastAcc = new Konva.Text ({
        x: x,
        y: y + 260,
        text: 'Last Accessed: ' + stats.atime,
        // name: file,
        fontSize: 16,
        width: 200,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })
    layer2.add(lastAcc);


    var type = new Konva.Text ({
        x: x,
        y: y + 400,
        text: 'type: ' + path.extname(src),
        // name: file,
        fontSize: 16,
        width: 80,
        fontFamily: 'Calibri',
        fontStyle: 'bold',
        fill: 'black',
    })
    layer2.add(type);


    stage.add(layer2);
}