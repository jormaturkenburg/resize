import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import Jimp from 'jimp';
// import JSZip from 'jszip';
import * as JSZip from 'jszip';
import saveAs from 'file-saver';

@Component({
  selector: 'app-resize',
  templateUrl: './resize.component.html',
  styleUrls: ['./resize.component.scss'],
})
export class ResizeComponent implements OnInit {
  public files: any[]; // All files
  public images: any[]; // Only the images
  public notImages: any[]; // The files that are not images
  public error: string; // Some text to display when incorrrect files are uploaded
  // public form;
  public width = new FormControl(600);
  public height = new FormControl();
  public crop = new FormControl('none');
  public processing = false;
  @ViewChild('fileInput', { static: false }) input;

  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit() {}
  public dropHandler(event) {
    // console.log(event);
    event.preventDefault();
    this.processing = true;
    this.files = event.dataTransfer
      ? event.dataTransfer.files
      : event.target.files;
    // console.log(this.files);
    this.images = [];
    this.notImages = [];
    let promises = Object.keys(this.files).map(key => {
      const promise = new Promise((resolve, reject) => {
        const file = this.files[key];
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
          const reader = new FileReader();
          reader.onload = e => {
            // file.src = e.target['result'];
            const src = e.target['result'] as string;
            Jimp.read(src).then(img => {
              // console.log(img.bitmap);
              // file.bitmap = img.bitmap;
              file.img = img;
              file.width = img.bitmap.width;
              file.height = img.bitmap.height;
              img.getBase64Async(file.type).then(url => {
                file.src = url;
                file.newSrc = url;
                resolve();
              });
            });
          };
          reader.readAsDataURL(file);
          this.images.push(file);
        } else {
          this.notImages.push(file);
          resolve();
        }
      });
      return promise;
    });
    Promise.all(promises).then(() => {
      this.processing = false;
    });
    if (this.notImages.length === 1) {
      this.error = `The following file: ${this.notImages[0].name} is not a JPEG or PNG image file.`;
    } else if (this.notImages.length > 1) {
      this.error = `The following files: ${this.notImages
        .map(file => file.name)
        .join(', ')} are not JPEG or PNG image files.`;
    } else {
      this.error = null;
    }
  }
  public dragOverHandler(event) {
    // console.log(event);
    event.stopPropagation();
    event.preventDefault();
  }
  public clickHandler(event) {
    this.input.nativeElement.click();
  }
  public widthChanged() {
    this.height.setValue(null);
  }
  public heightChanged() {
    this.width.setValue(null);
  }
  public cropChanged() {
    // console.log(this.crop.value);
  }
  public getNewSources() {
    this.processing = true;
    let promises = this.images.map(file => {
      return file.img.getBase64Async(file.type).then(url => {
        file.newSrc = url;
      });
    });
    Promise.all(promises).then(() => {
      this.processing = false;
    });
  }
  public reset() {
    this.processing = true;
    let promises = this.images.map(file => {
      return Jimp.read(file.src).then(img => {
        file.img = img;
        file.width = img.bitmap.width;
        file.height = img.bitmap.height;
        return img.getBase64Async(file.type).then(url => {
          file.newSrc = url;
        });
      });
    });
    Promise.all(promises).then(() => {
      this.processing = false;
    });
  }
  public doTheBusiness() {
    // The please wait overlay depends on processing being true, for some reason
    // the overlay only actually shows up sometimes. I have tried kicking off CD manually,
    // setting a timeout and logging. None worked...
    this.processing = true;
    // this.cd.detectChanges();
    // setTimeout(() => {
    if (this.crop.value === 'none') {
      if (this.width.value) {
        this.images.map(image => {
          image.img.resize(parseInt(this.width.value, 10), Jimp.AUTO);
        });
      }
      if (this.height.value) {
        this.images.map(image => {
          image.img.resize(Jimp.AUTO, parseInt(this.height.value, 10));
        });
      }
    } else {
      this.images.map(image => {
        if (image.img.bitmap.width > image.img.bitmap.height) {
          // Landscape
          image.img.resize(
            Jimp.AUTO,
            parseInt(this.width.value || this.height.value, 10),
          );
          switch (this.crop.value) {
            case 'none':
              break;
            case 'left':
              image.img.crop(
                0,
                0,
                this.width.value || this.height.value,
                this.width.value || this.height.value,
              );
              break;
            case 'center':
              image.img.crop(
                (image.img.bitmap.width -
                  (this.width.value || this.height.value)) /
                  2,
                0,
                this.width.value || this.height.value,
                this.width.value || this.height.value,
              );
              break;
            case 'right':
              image.img.crop(
                image.img.bitmap.width -
                  (this.width.value || this.height.value),
                0,
                this.width.value || this.height.value,
                this.width.value || this.height.value,
              );
              break;
          }
        } else {
          // Portrait
          image.img.resize(
            parseInt(this.width.value || this.height.value, 10),
            Jimp.AUTO,
          );
          switch (this.crop.value) {
            case 'none':
              break;
            case 'left':
              image.img.crop(
                0,
                0,
                this.width.value || this.height.value,
                this.width.value || this.height.value,
              );
              break;
            case 'center':
              image.img.crop(
                0,
                (image.img.bitmap.height -
                  (this.width.value || this.height.value)) /
                  2,
                this.width.value || this.height.value,
                this.width.value || this.height.value,
              );
              break;
            case 'right':
              image.img.crop(
                0,
                image.img.bitmap.height -
                  (this.width.value || this.height.value),
                this.width.value || this.height.value,
                this.width.value || this.height.value,
              );
              break;
          }
        }
      });
    }
    // }, 1000);
    this.getNewSources();
  }
  public download() {
    if (this.images.length > 1) {
      let zip = new JSZip();
      let promises = this.images.map(image => {
        return image.img.getBufferAsync(image.type).then(buffer => {
          zip.file(image.name, buffer, { binary: true });
          console.log(buffer);
        });
        // return image.img.getBase64Async(image.type).then(url => {
        //   zip.file(image.name, url, { base64: true });
        //   console.log(url);
        // });
      });
      Promise.all(promises)
        .then(() => {
          console.log('All done');
          return zip.generateAsync({ type: 'blob' });
        })
        .then(zipBlob => {
          saveAs(zipBlob, 'images.zip');
        });
    } else {
      let image = this.images[0];
      image.img.getBase64Async(image.type).then(url => {
        saveAs(url, image.name);
      });
    }
  }
}
