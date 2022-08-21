import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-zoom-range',
  templateUrl: './zoom-range.component.html',
  styles: [
    `
      .mapa-container{
        width:100%;
        height:100%
      }

      .row{
        background-color:white;
        border-radius:5px;
        bottom:50px;
        left:50px;
        width:400px;
        padding:10px;
        position:fixed;
        z-index:999;
      }
    `
  ]
})
export class ZoomRangeComponent implements AfterViewInit, OnDestroy{

  /* vamos a usar el viewchild para tomar un elemento html y utilizarlo como una propiedad entonces tomamos la referencia local que usamos en el html #mapa y lo vamos a llamar divMapa para inicializar ese view child toca usar el afterviewinit ya que en el ngoninit do se logra tomar la referencia del elemento  */

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel:number = 10;
  center: [number, number] = [-76.49235334857103, 3.5877809657198263];

  constructor() { }

  //tener en cuenta, siempre que se usan eventos hay que destruirlos cuando se destruye el componente
  ngOnDestroy(): void {
    this.mapa.off('zoom', ()=>{}),
    this.mapa.off('zoomend', ()=>{})
    this.mapa.off('move', ()=>{})

  }
  

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      //reemplazamos el id que teniamos como mapa antes por el this.divMapa
      container: this.divMapa.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: this.center, // starting position [lng, lat]
      zoom: this.zoomLevel // starting zoom
  });

  // ahora vamos a usar un eventlistener para saber cuando se esta dando zoom ya sea dando click o con la perilla del mouse este evento es propìo de mapa de la libreria de ellos
    this.mapa.on('zoom', (ev)=>{
      const zoomActual = this.mapa.getZoom();
      this.zoomLevel = zoomActual;
    });

    this.mapa.on('zoomend', ()=>{
      if(this.mapa.getZoom() > 18)
        this.mapa.zoomTo(18);
    });

    //movimiento del mapa
    this.mapa.on('move', (event)=>{
      const target = event.target;
      const {lng, lat} = target.getCenter();
      this.center = [lng, lat]
    })
  }

  zoomOut(){
    this.mapa.zoomOut();

  }

  zoomIn(){
    this.mapa.zoomIn();
  }

  zoomCambio(valor:string){
    this.mapa.zoomTo(Number(valor))
  }

}
