//
//  Image.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Jan 2023
//

export function preloadImage(src: string): string {
  let preloader = new Image();
  preloader.src = src;
  return preloader.src;
}

export function preloadImages(imgs: string[]): string[] {
  return imgs.map((img) => preloadImage(img));
}
