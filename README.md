# Resize

Behold: [resize.livecharts.nl](https://resize.livecharts.nl)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.24. It uses [Jimp](https://www.npmjs.com/package/jimp), [File-Saver](https://www.npmjs.com/package/file-saver) and [JSZip](https://www.npmjs.com/package/jszip) to allow uploading, resizing and cropping of JPEG and PNG images and downloading in a single image or zip-file.

## Known issues

resize.component.html contains an overlay that is switched with an \*ngIf and a variable 'processing' that doesn't always work correctly. Also, there seems to be an issue with File-Saver and Firefox for iOS. Files aren't saved but opened as plain text in the browser.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Yeah, no tests of any kind.
