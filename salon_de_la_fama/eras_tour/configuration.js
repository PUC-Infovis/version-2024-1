const csvFilePath = './posiciones_estadios.csv';

let CANCIONES = [];
function preprocesarEstadios(filtro_album, fecha) {
    d3.csv(csvFilePath).then(datosSinFiltrar => {
      
      if (filtro_album === false){
        console.log(datosSinFiltrar)
        datos = datosSinFiltrar.filter(d => {
          return d.Fecha_presentacion <= fecha;
        });
        console.log(datos)
        estadios = d3.groups(datos, (d) => d.Lugar_presentacion);
        console.log(estadios)
        crearMapa(estadios)

      }

      else {
          console.log(datosSinFiltrar)
          datos = datosSinFiltrar.filter(d => {
            console.log(filtro_album)
            return d.Fecha_presentacion <= fecha && d.Album === filtro_album;
          });
          console.log(datos)
          estadios = d3.groups(datos, (d) => d.Lugar_presentacion);
          console.log(estadios)
          crearMapa(estadios)
  
        
      }

  
      })

}




