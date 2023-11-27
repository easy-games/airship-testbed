This project contains the source to BedWars & the Core package.

- The Core package is used globally across all Airship games.
- The BedWars game is just a game. It's not shared globally.

## Folder Setup
1. Clone [Airship](https://github.com/easy-games/airship) into the same parent folder as this repo. That is, both "airship" and "bedwars-airship" should be siblings.

## Github Access Token
1. An access token is required to download private code from our node repositories. Create and copy a Github Personal Access Token from Github.com. [Here is the link to the create token page.](https://github.com/settings/tokens). **Generate a "classic" token. For permissions, check "repo" and "read packages".**

![](https://1260643417-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FcEFcdlZM6gv3wpelI0y4%2Fuploads%2Fghxbb1PeRiwrvfktGTlB%2FScreenshot%202023-06-29%20at%209.45.07%20AM.png?alt=media&token=0c6ba1bd-1e10-496c-8723-e493318ea76d)
![](https://1260643417-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FcEFcdlZM6gv3wpelI0y4%2Fuploads%2FJBa2TYVbisi0XR6k8s0z%2FScreenshot%202023-06-29%20at%2011.10.47%20AM.png?alt=media&token=d174351d-299b-4e27-b9d7-723c6e1b3fc3)
![](https://1260643417-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FcEFcdlZM6gv3wpelI0y4%2Fuploads%2FVezqw0gvObOAY1Tna0eE%2FScreenshot%202023-06-29%20at%209.46.31%20AM.png?alt=media&token=aadbec1f-5543-4745-a569-d237082b48b1)

2.  In Unity, open menu item **Airship > Configuration** and paste the Github Access Token.

## Setting up the TypeScript Project (Optional. Recommended for programmers only!)
Note: you must open the project in Unity before building the Typescript.

Use Git Bash on PC, or Terminal on Mac:
First, `cd` into the TypeScript project directory.
```
cd Assets/Typescript~
```

Next, install node dependencies.
```
npm i
```

Now start the compiler in watch mode.
```
npm run watch
```

## Using ParrelSync for the Server
We use a tool called ParrelSync to create a clone of the project that runs as the server. You don't make changes to the clone, only the main project. Any changes you make in the main project is auto-synced to the clone. 

1. Select **ParrelSync > Clones Manager**

![Screenshot of ParrelSync menu options](https://1260643417-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FcEFcdlZM6gv3wpelI0y4%2Fuploads%2F7Ru4cjlBQNZtnYfRuLXx%2FScreenshot%202023-06-27%20at%201.46.15%20PM.png?alt=media&token=63de4251-1015-4d31-a657-d47cb40d3d9e)

2. Click **Create New Clone**. This will generate a copy of the project that will act as our server. 
Once complete, set the arguments to "server"

![](https://1260643417-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FcEFcdlZM6gv3wpelI0y4%2Fuploads%2FxXLbPbc6h43YWIy1QfSK%2FScreenshot%202023-06-27%20at%201.47.07%20PM.png?alt=media&token=7d07ab15-5562-4198-ad40-ba82895a4f54)

3. Click **Open in New Editor**
