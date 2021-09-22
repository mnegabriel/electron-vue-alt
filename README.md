# Vue electron app

This is a copied private repository as to make it's content almost completely public ( except private credentials ) and share the knowledge on how to implement a Auto-updating Vue Electron App

## Create aplication

We're using [Vue CLI](https://cli.vuejs.org/guide/installation.html#installation) in this repository, since it can scaffold easily the app with Electron. after installing the CLI, create the project with: 

```bash
vue create <app-name>
```

The cli will ask for the project settings. Choose the default Vue 3 configuration. After that, enter the project folder to start the Electron configuration

```bash
cd <app-name>
```

## Electron Config

Inside the project folder created by the Vue CLI, we are going to use the [Vue CLI Plugin Electron Builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/) to turn our Vue app into a **Vue-Electron** app. 

The Vue CLI has a command that do this work for us:

```bash
vue add electron-builder
```

The cli will add a `background.js` file at the `/src` folder ( which will configure the Electron app initialization ), as well as some dependencies and scripts in the `package.json` file. With this, our app can already be served with the command:

```bash
yarn electron:serve
```

## Acessing the machine files

This project will work with content that will be required to store in the local machine and to access that functionality inside the `.vue` files, we need:

- add the `@electron/remote` package
  
    ```bash
    yarn add @electron/remote
    ```

    >it also enables [Interprocess Communication ( IPC )](https://www.electronjs.org/docs/latest/glossary/#ipc) functionalities


- update the `src/background.js` file:

    ```js
    /// after default imports 
    require('@electron/remote/main').initialize()
    ...
    //Inside createWindow()
    const win = new BrowserWindow({
        ...
        webPreferences: {
            ...,
            enableRemoteModule: true
        }
    })
    ```

- to create a `vue.config.js` file at the root of the project with this settings on it:

    ```js
    module.exports = {
        pluginOptions: {
            electronBuilder: {
                nodeIntegration: true,
            }
        }
    }
    ```

With this, we can use **Node's** `fs` and `path` modules inside the Vue app.

## Creating an Installer file

The Vue CLI has a command that easily create an installer for the app that we've set up. 

```bash
yarn electron:build
```

This command will create a file inside `dist_electron` folder that can be used to install the app, but keep in mind that **this command will create an installer for the oparating system that the it was run in**.

## Auto-Updating 

### Configuration

A growing app will need to detect updates and be able to update itself. To make this possible, we need to make some important changes to it's configuration.

> Important note: This documentation will be using [Github](https://github.com/) to keep track of updates. 
> 
> While the CLI makes this process very simple for a public repository, this documentation will describe how to set up autoupdates for private repositories, which will need more boilerplate code.

1. Since we will be using a private repository to hold the app source code and serve the future releases, we need to grab from the account:
    - an [access token](https://github.com/settings/tokens) 
        - choose the option to give `Full control of private repositories ` 
        - keep in mind that after creating, the token will not be shown a second time
    - the github username ( `https://github.com/<github_username>` )

2. We need to install the `electron-updater` package.

    ```bash
    yarn add electron-updater
    ```

3. After that we need to configure some files to use this package utilities.

    `src/background.js`
    ```js
    import { autoUpdater } from "electron-updater";
    ...
    //Inside createWindow(), at the end
    process.env.GH_TOKEN = "<access_token>"
    autoUpdater.checkForUpdatesAndNotify();    
    ```

    `vue.config.js`
    ```js
    module.exports = {
        pluginOptions: {
            electronBuilder: {
                ...,
                builderOptions: {
                    publish: [
                        {
                            provider: "github",
                            owner: "<github_username>",
                            private: true,
                            token: "<access_token>"
                        }
                    ]
                }
            }
        }
    };  
    ```

4. We also need to set the github token locally to enable new releases publishing of private repository

    ```bash
    # Windows terminal
    set GH_TOKEN=<your_token_here>
    # Linux / macOS terminal
    export GH_TOKEN=<your_token_here>
    ```

5. Finally, we need to add some information to the `package.json` file

    ```json
    {
        ...
        "private": true,
        "author": "<github_username>",
        ...
    }
    ```

### Triggering updates

After all theses configuration steps, we need to start creating version releases for the app. 

We begin by committing and pushing the configurations described above to the private Github repo, then we need to run 

```bash
yarn electron:build -p always
```

This command will 
- build the app into the folder `dist_electron` 
- create a draft release in the Github repository, with all the necessary binaries. 
 
After that, go to the Github repository page and click at the ***Releases*** tab. There will be a draft release with the `package.json` version as the name / tag. Click `edit` and publish the release.

>The first release will not change or trigger anything in the app, the subsequent ones will.

To publish a new update to the app, you will need to publish a new release. To to that:

- it's necessary to change the version at `package.json` file
- Commit and push all changes
- run again:

    ```bash
    yarn electron:build -p always
    ```

A new version of the app will be generated in the `dist_electron` folder and a new release at the repository will be drafted. Again, go to the repository ***Releases*** tab and publish the new draft. 

Everyone with the app opened ( and internet connecton ) will be propted after some minutes about a new update, which the app will automatically download and build at it's next opening.

## Electron important considerations

### Working with ***path*** module

To work with the `path` module inside the Electron app, it's possible to get a path location reference to the app with the `app` object from `@electron/remote`

`example.vue`
```js
import { app } from "@electron/remote";

app.getAppPath() 
// returns path/to/app
```

> **IMPORTANT !**  
>   
> While working in development with:
> 
> ```bash
> yarn electron:serve
> ```
> 
> This path will correspond to the `dist_electron` folder inside the project, but after built and installed, this method will return the path to `<app>/resources/app.asar` file.
> 
> This will affect the behavior of the aplication, since ***the path returned is not a folder anymore***.

### Kiosk mode

To enable Kiosk mode on the window, we can set an option when we create the window

`src/background.js`
```js
const win = new BrowserWindow({
    ...,
    kiosk: true
})
```

In certain OS's this won't be enough to force the app to maintain the kiosk mode, so we can use some window event listeners to restore focus to the window and set it once again as kiosk. Some of these events are: `blur`, `resize`, `hide`, `minimize`, `leave-full-screen`, `move` ...

```js
const resetKiosk = () => {
    win.restore();
    win.focus();
    win.setKiosk(true);
}

win.on('blur', resetKiosk)
win.on('resize', resetKiosk)
win.on('hide', resetKiosk)
win.on('minimize', resetKiosk)
win.on('leave-full-screen', resetKiosk)
win.on('move', resetKiosk)
```

## References
Documentations
- [Vue CLI](https://cli.vuejs.org/)
- [Vue CLI Plugin Electron Builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/)  

Videos
- [Vue 3 with Electron - Building a desktop applications with Vue and Electron](https://www.youtube.com/watch?v=LnRCX074VfA)

Articles
- [Vue CLI Plugin Electron Builder — Auto Update (Private GitHub Repository)](https://psycarlo.medium.com/vue-cli-plugin-electron-builder-auto-update-private-github-repository-229ba2c8f61e)