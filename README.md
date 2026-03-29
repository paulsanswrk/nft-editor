# Interactive Spirals

A 3D geometry and interactive math visualization application built with [Babylon.js](https://www.babylonjs.com/), [Vue 3](https://vuejs.org/), and TypeScript.

This project contains multiple visualizations and entry points for generating, rendering, and animating different mathematical spiral shapes.

## Features

- **3D Rendering**: High-performance WebGL 3D rendering powered by Babylon.js.
- **Parametric Generation**: Real-time generation of spirals and geometric forms.
- **Multiple Visualization Modes**: Different isolated views like `top_8_rot`, `bot_6_rot`, `plain`, and `wire`.
- **Full Control Dashboard**: An interactive Vue 3-powered GUI (`full_control`) with rich UI components (PrimeVue) to manipulate spiral parameters in real-time.

## Setup & Installation

Ensure you have [Node.js](https://nodejs.org/) installed, then run the following command from the repository's root folder to install all dependencies:

```bash
npm install
```

## Running the Application

The project uses Webpack and provides multiple development server entry points depending on the visualization you want to test. 

Run any of the following commands to start a `webpack-dev-server`:

- **Main / Default dev server:**
  ```bash
  npm start
  ```
- **Full Control App (Vue 3 GUI):**
  ```bash
  npm run start_full_control
  ```
- **Top 8 Rot View:**
  ```bash
  npm run start_top_8
  ```
- **Bottom 6 Rot View:**
  ```bash
  npm run start_bot_6
  ```
- **Plain View:**
  ```bash
  npm run start_plain
  ```
- **Wire View:**
  ```bash
  npm run start_wire
  ```

After starting a local server, the application is typically accessible via `http://localhost:8080` (or the port indicated in your console output).

## Building for Production

To create an optimized production build, you can use the following commands:

- **Build main application:**
  ```bash
  npm run build
  ```
- **Build Full Control App:**
  ```bash
  npm run build_full_control
  ```
- **Build Multipage App:**
  ```bash
  npm run multipage
  ```

Build artifacts will be output to the `dist/` directory.

## Project Structure

- `src/` - Contains all TypeScript source code and assets.
  - `full_control/` - Vue 3 application containing the complex GUI controls.
  - `top_8_rot/`, `bot_6_rot/`, `plain/` - Specialized Babylon.js entry points for distinct visualization modes.
  - `common/` - Shared types, math utilities, and data structures.
- `public/`, `build/`, `dist/` - Static assets and configured build outputs.

## Technologies Used

- [TypeScript](https://www.typescriptlang.org/)
- [Babylon.js Series 7](https://www.babylonjs.com/)
- [Vue 3](https://vuejs.org/)
- [PrimeVue](https://primevue.org/)
- [Webpack 5](https://webpack.js.org/)
