---
title: 'How to setup a Phoenix 1.6 application using Webpack and React'
publishedAt: '2022-08-14'
author: 'Tayte Stokes'
excerpt: ''
featured: true
---

Recently as of Phoenix v1.6, the framework replaced bootstrapping the application assets using Node, Npm, and Webpack with Esbuild. There are many good reasons for this change and this [blog post](https://fly.io/blog/phoenix-moves-to-esbuild-for-assets/) authored by Mark Ericksen is an easy read that highlights why this change was made.

However, if you are like me and have been using Webpack as the choice of bundler for some time now and aren't ready to give it up just yet, then you're in the right place.

In this post I'll be going over how to setup a new application using Phoenix v1.6 that will render a single page application for the frontend that utilizes Webpack as the asset bundler, Babel as the Javascript compiler, and React as the view library.

## Creating A New Phoenix Application

I'm assuming that your machine is already setup with Node, Elixir, and Phoenix so we won't be covering how to get your machine setup for development.

First, let's create a new Phoenix project using a mix task and provide the flag telling Phoenix not to generate frontend assets.

If you are interested, you can read more about what options are available to pass with this command [here](https://hexdocs.pm/phoenix/Mix.Tasks.Phx.New.html).

```
$ mix phx.new --no-assets
```

Now with the new Phoenix application created, we are ready to get started building out the frontend portion of our application using Webpack, React, and Babel.

However, before we start building out the frontend, I think it's important to understand how Phoenix serves the static assets that make up the frontend.

## How Phoenix Serves Static Assets

Phoenix handles serving static assets by using the Plug.Static plug. This plug is be found inside the Endpoint module that every request that is made to the server goes through.

```
## lib/example_web_app/endpoint.ex

plug Plug.Static,
    at: "/",
    from: :example_app,
    gzip: false,
    only: ~w(assets fonts images favicon.ico robots.txt)
```

The Plug.Static plug will serve static assets from the `priv/static` directory of the application.

If you look at the snippit above, the Plug.Static plug has a few configuration options that are being set by default that are important to call out.

The `at` configuration defines where to reach for static assets, in our case this will be the default request path at `/`. This needs to be a string.

The `from` option defines the file path to read the static assets from. This will be an atom that represents that applications name where assets will be served from the `priv/static` directory.

The `only` option is used to filter which requests to serve. This is useful to prevent file system access on every request when the `at` option is set to the default path of `/`. This will take a list of folder and file names that exist inside the `priv/static` folder that will only be served by the Plug.Static plug.

If you're interested, you can read more about the configuration options available for the Plug.Static plug [here](https://hexdocs.pm/plug/Plug.Static.html).

As of version 1.6, Phoenix uses Esbuild to prepare assets that need to be preprocessed and extract them to the `priv/static/assets` directory. This file migration happens during development mode using a watcher and in production by running a deploy script.

Instead of Esbuild, we will be using Webpack to prepare our assets and migrate the processed assets to the `priv/static/assets` directory.

Now with that in mind, let's move on and finally start building our frontend portion of the application.

## Initializing The Frontend Directory

The standard convention for a Phoenix application is to store all frontend code in the `assets` folder, so we will be using that folder to build our fronntend application in.

Now let's set this folder up as it's own project with npm and get a `package.json` file created to manage the dependencies and scripts that the frontend application will rely on.

Inside of the `assets` folder, execute the npm command to initialize the folder as it's own project and pass it the _-y_ flag to accept all of the default configuration for the package.json file that will be created.

```
$ npm init -y
```

We should now have a `package.json` file inside of the `assets` folder that looks like the following.

```
## assets/package.json

{
  "name": "assets",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

We won't worry about modifying the `package.json` for now and leave as it is.

The only thing left to finish initializing our frontend application is to define the entry point file for our frontend application.

Since we are planning on turning this into a React application, we will follow some common React patterns and store all of our application code in a `src` folder that sits next to all of the configuration files. Go ahead and create an `index.js` file that will live in the `src` folder.

```
## assets/src/index.js

console.log("Hello, world!")
```

In tradition with every new web application, it's just a simple script that logs "Hello, world!" to the console. We will be coming back and updating this file later once we start implementing React.

With that in place, we can start installing the dependencies we will need and configure the build tools for our frontend application.

## Setting Up Webpack and Babel

This isn't a comprehensive guide around Webpack and Babel so I won't be going into too much detail about configuring these tools, but I will be highlighting the important parts that are related to what makes them work with our Phoenix application.

In order for us to start using Webpack and Babel, we need to install the required dependencies from npm.

Inside of the `assets` directory, go ahead and execute the following command to install the dependencies we need for the Webpack and Babel configurations.

```
$ npm install webpack webpack-cli @babel/core @babel/preset-env babel-loader css-loader style-loader url-loader --save-dev
```

Before we configure Webpack and Babel, let's do some good samaritan work annd make sure that we ignore pushing the node modules to the cloud. Add the file path to the `node_modules` folder in the `assets` directory to the `.gitignore` that exists at the root of the Phoenix application.

```
## .gitignore

/assets/node_modules
```

Now let's add a `.babelrc` and add the appropriate Babel presets that we will need to help compile our Javascript.

```
## assets/.babelrc

{
  "presets": ["@babel/preset-env"]
}
```

Now it's time to add the config file for Webpack.

```
## assets/webpack.config.js

const path = require("path");

module.exports = {
  entry: {
    main: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "../priv/static/js"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: "url-loader",
        options: { limit: false },
      },
    ],
  },
};
```

That should be good enough to get us going with creating a simple application. If you're absolutely dying to know more about these configurations you can check out the [Webpack](https://webpack.js.org/) and [Babel](https://babeljs.io/) docs.

Above, we define that the entry point file for the frontend application is that one that we created earlier which is `assets/src/index.js` and bundle which gets created from Webpack will be called `main`.

```
entry: {
    main: "./src/index.js",
},
```

Remember earlier how we talked about how the Plug.Static plug is what serves assets for our application from the `priv/static` directory?

If you look at the Webpack config, you can see that we define that the output of the bundled Javascript for our frontend application should be dumped into that directory.

```
output: {
    path: path.resolve(__dirname, "../priv/static/js"),
},
```

With this configuration set in place, a `priv/static/js/main.js` file will be generated which houses the bundled Javascript code for our frontend application and will allow the Plug.Static to serve our bundled Javascript assets to be accessed.