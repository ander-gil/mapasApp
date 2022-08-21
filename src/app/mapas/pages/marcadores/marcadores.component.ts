import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

interface MarcadorColor{
  color:string;
  marker?:mapboxgl.Marker;
  centro?: [number, number]
}
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container{
        width:100%;
        height:100%
      }

      .list-group{
        position:fixed;
        top:20px;
        right:20px;
        z-index:99;
      }

      li{
        cursor:pointer;
      }

    `
  ]
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel:number = 15;
  center: [number, number] = [-76.49235334857103, 3.5877809657198263];

  //arreglo de marcadores
  marcadores:MarcadorColor[]= [];

  constructor() { }
  

    ngAfterViewInit(): void {

      this.mapa = new mapboxgl.Map({
        //reemplazamos el id que teniamos como mapa antes por el this.divMapa
        container: this.divMapa.nativeElement, // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: this.center, // starting position [lng, lat]
        zoom: this.zoomLevel // starting zoom
    });

    this.leerLocalStorage();

    //agregar un elemento personalizado comopor ejemplo un texto
    /* const marketHtml:HTMLElement = document.createElement('div');
    marketHtml.innerHTML= 'vivienda de Ander Gil' 
    const marker = new mapboxgl.Marker({
      element:marketHtml
    }) */

    //toda esta parte esta  en la documentacion de mapbox, y aqui quedan los marcadores fijos no son dinamicos 
      //const marker = new mapboxgl.Marker()
      //.setLngLat(this.center)
      //.addTo(this.mapa)
  }

  irMarcador(market:mapboxgl.Marker){
    //cuando se le da click a uno de los marcadores que se encuentra desplegado en el menu la camara se va dirigir hasta ese marcador

    this.mapa.flyTo({
      center: market.getLngLat()
    })

  }
// ya aqui el marcador es dinamico cuando le doy click en el menu voy al marcador que tengo prestablecido conmis coordenadas
  agregarMarcador(){

    //para generar un color aleatorio
    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));

    const nuevoMarcador = new mapboxgl.Marker({ /* al agregar esto puedo mover el marcador con el mouse */               draggable:true,
    color:color
    })
    .setLngLat(this.center)
    .addTo(this.mapa)
    //esto se hace asi ya que marcador no es de tipo marker entonces toca convertirlo de esta manera para que coincida con la interfaz que se creo al inicio, esto se hace para que el color que se le esta agregando a cada marcador tambien quede en el menu para cada marcador que le corresponda
    this.marcadores.push({color:color, marker:nuevoMarcador});

    this.guardarMarcadorLocalStorage()

    nuevoMarcador.on('dragend', () => {

      this.guardarMarcadorLocalStorage();

    })
  }

  guardarMarcadorLocalStorage() {
    //toca crear un arreglo para guardar los marcadores que salieron del foreach, tambien toca modificar la interfaz y agregar centro : [number, number]
    //toca  ejecutar este metodo cuando se agrega un marcador 

    const lngLatArr:MarcadorColor[] = []

    this.marcadores.forEach( m =>{

      const color  = m.color;
      const {lng, lat} = m.marker!.getLngLat();

      lngLatArr.push({
        color: color,
        centro: [lng, lat]
      });
    })

    localStorage.setItem('marcadores', JSON.stringify(lngLatArr))

  }

  // esta funcion se manda a llamar a lo que se cargue el mapa  para cargar los marcadores que estan cargados en el localstorage
  leerLocalStorage(){

    if(!localStorage.getItem('marcadores')){
      return;
    }

    const lngLatArr:MarcadorColor[] = JSON.parse( localStorage.getItem('marcadores')! );

    lngLatArr.forEach(m => {

      const newMarker = new mapboxgl.Marker({ color: m.color, draggable:true})
        .setLngLat(m.centro!)
        .addTo(this.mapa)

        this.marcadores.push({
          marker: newMarker,
          color: m.color    
        });

        //es un listener usado para cuando se deja de arastrar un marcador del mapa
        newMarker.on('dragend', () => {
          this.guardarMarcadorLocalStorage();
        })
    })    
  }

  borrarMarcador(i:number){
    //para borrar del mapa
    this.marcadores[i].marker?.remove();
    //para borrar del menu
    this.marcadores.splice(i, 1);

    this.guardarMarcadorLocalStorage();

  }

}
