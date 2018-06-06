var features, nest, bar;

    var width = 850,
        height = 650,
        active = d3.select(null);

    var projection = d3.geoMercator()
                       .scale(50000)
                       .center([-99.144, 19.325])
                       .translate([width/2, height/2]);

    var select = d3.selectAll(".select");

    var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);

    svg.append("rect")
       .attr("class", "background")
       .attr("width", width)
       .attr("height", height)
       .on("click", reset);

    var g = svg.append("g")
               .attr("id", "estados");

    var barSvg = d3.select("body").append("svg")
               .attr("id", "bars")
               .attr("height", 400)
               .attr("width", 500);

    var path = d3.geoPath().projection(projection);

    d3.json('D3.json', function(error, datos) {

        features = topojson.feature(datos, datos.objects.D3);

        var propiedades = features.features.map(function(seccion) {return seccion.properties;});
        nest = d3.nest()
          .key(function(d) { return d.seccion; })
          .rollup(function(values) {
            return {
              SECCION: +d3.values(values)[0]['seccion_1'],
              DISTRITO_FEDERAL: +d3.values(values)[0]['distrito'],
              DISTRITO_LOCAL: +d3.values(values)[0]['DISTRITO_L'],
              COLONIA: +d3.values(values)[0]['NOMBRE'],
              LISTA_NOMINAL: +d3.values(values)[0]['LISTANOMIN'],
              PARTICIPACION_18_12: +d3.values(values)[0]['P18_12'],
              ESTIMACION_PRI: +d3.values(values)[0]['E_PRI'],
              VOTOS_1_3: +d3.values(values)[0]['VNS1_3'],
              VOTOS_1_8: +d3.values(values)[0]['VNS1_8'],
              DIF_VOTOS_13_18: +d3.values(values)[0]['DIFV_13_18']
            };
          })
          .entries(propiedades);


        select.on("change", function(d) {
           var interes = "";
           d3.selectAll(".select").each(function(d,i){ return interes+=this.value;});
           hazMapa(interes);
        });
        var interes = "";
           d3.selectAll(".select").each(function(d,i){ return interes+=this.value;});
           hazMapa(interes);
    });

    function hazMapa(interes){

        var max = d3.max(features.features, function(d) { return d.properties[interes]; })

        var quantize = d3.scaleQuantile()
                         .domain([0, max])
                         .range(d3.range(6).map(function(i) { return "q" + i; }));

         var mapUpdate = g.selectAll("path")
                          .data(features.features);

         var mapEnter = mapUpdate.enter();

         mapEnter.append("path")
                 .merge(mapUpdate)
                 .attr("d", path)
                 .attr("class", function(d){ return quantize(d.properties[interes]) } )
                 .on("click", clicked);
    }

    d = [{nombre: "SECCION", datos: "Sección"}, {nombre: "DISTRITO_FEDERAL", datos: "Distrito Federal"}, {nombre: "DISTRITO_LOCAL", datos: "Distrito Local"}, {nombre: "COLONIA", datos: "Colonia"},
    {nombre: "LISTA_NOMINAL", datos:"Lista Nominal"}, {nombre: "PARTICIPACION_18_12", datos: "Part. 2015 con métricas 2012"}, {nombre: "ESTIMACION_PRI", datos: "Estimación del voto PRI"},
    {nombre: "VOTOS_1_3", datos: "Voto necesario por sección 1.3 M"}, {nombre: "VOTOS_1_8", datos: "Voto necesario por sección 1.8 M"}, {nombre: "DIF_VOTOS_13_18", datos: "Diferencia de votos 1.3 a M"}];

    var barWidth = 0,
      barHeight = 35;
    var x = d3.scaleLinear()
            .range([0, barWidth])
            .domain([0, 300]);

    bar = barSvg.selectAll(".bar")
              .data(d);

    var barEnter = bar.enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; })

    d3.select("#titulo").html("Información Electoral");

    barEnter.append("text")
          .transition()
          .duration(500)
          .attr("x", 10)
          .attr("y", barHeight / 2)
          .attr("dy", ".35em")
          .text(function(d) { return d.datos });

    function hazGrafica(secc){
        var votos = ['SECCION', 'DISTRITO_FEDERAL', 'DISTRITO_LOCAL', 'COLONIA', 'LISTA_NOMINAL',
        'PARTICIPACION_18_12', 'ESTIMACION_PRI', 'VOTOS_1_3', 'VOTOS_1_8', 'DIF_VOTOS_13_18'];
        var info = ["Sección", "Distrito Federal", "Distrito Local", "Colonia", "Lista Nominal",
        "Part. 2015 con métricas 2012", "Estimación del voto PRI",
        "Voto necesario por sección 1.3 M", "Voto necesario por sección 1.8 M", "Diferencia de votos 1.3 a M"];
        var datos = [];

          for (i = 0; i <= 10 ; i++){
            c = {};
            c["nombre"] = votos[i];
            c["var"] = info[i];
            c["valor"] = secc[0].value[votos[i]];
            datos.push(c);
        }

        var barWidth = 300,
              barHeight = 35;
          var x = d3.scaleLinear()
                    .range([0, barWidth])
                    .domain([0, 300]);

          bar = barSvg.selectAll(".bar")
                      .data(datos, function(d){ return d.nombre;});

          d3.select("#titulo").html("Información electoral")

          barEnter.append("text")
                  .transition()
                  .duration(500)
                  .attr("x", 10 )
                  .attr("y", barHeight / 2)
                  .attr("dy", ".35em")
                  .text(function(d) { return d.var });

          bar.select("rect")
             .transition()
             .duration(500)
             .attr("width", 500);

          bar.select("text")
             .transition()
             .duration(500)
             .attr("x", 250)
             .text(function(d) { return d.valor; });

      }


    function clicked(d) {
        if (active.node() === this) return reset();
        active.classed("active", false);
        active = d3.select(this).classed("active", true);

        var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

        g.transition()
         .duration(750)
         .style("stroke-width", 5 / scale + "px")
         .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

        var secc = nest.filter(function(a) {
              return a.key == d.properties.seccion;
           });

        hazGrafica(secc);
   }

   function reset() {
        active.classed("active", false);
        active = d3.select(null);

        g.transition()
         .duration(750)
         .style("stroke-width", "1.5px")
         .attr("transform", "");
    }
	  
	  
	function busquedaDatos()
	  { 
		  
		  
		 var seccionAux = document.getElementById("txtSearch").value; 
		  alert(colonia);
	  }
	  