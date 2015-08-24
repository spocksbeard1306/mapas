var Mapa2 = React.createClass({
    getInitialState: function(){
        return {
            map_height: Math.max(500, window.innerHeight),
            map_width: Math.max(960, window.innerWidth),
            lat_cen: 0,
            lon_cen: 0,
            zoom: 0
        };
    },
    render: function(){
        return(
                <div id = "mapa2"></div>
        );
    },
    componentDidMount: function(){
        var p = 2, drawBuildings = true;
        var mH = this.state.map_height;
        var mW = this.state.map_width;
        var prefix = prefixMatch(["webkit", "ms", "Moz", "0"]);
        var tile = d3.geo.tile().size([mW, mH]);

        var projection = d3.geo.mercator()
            .scale((1 << 14) / p / Math.PI)
            .translate([-mW/2, -mH/2 ]);
        var tileProjection = d3.geo.mercator();

        var tilePath = d3.geo.path()
            .projection(tileProjection);

        var zoom = d3.behavior.zoom()
            .scale(projection.scale() * p * Math.PI)
            .scaleExtent([1 << 200, 1 << 25])
            .translate(projection([-77, -12, ]).map(function(x){
                return -x;
            }))
            .on("zoom", zoomed);
        var map = d3.select("#mapa2").append("div")
            .attr("class", "map")
            .style("width", mW + "px")
            .style("height", mH + "px") 
            .call(zoom)
            .on("mousemove", mousemoved);
        var layerWater = map.append("div")
            .attr("class","layerWater");

        var layerRoads = map.append("div")
            .attr("class","layerRoads");

        var layerBuildings = map.append("div")
            .attr("class","layerBuildings");

        var info = map.append("div")
            .attr("class", "info");

        zoomed();

        function zoomed(){
            var surl = "http://vector.mapzen.com/osm/";
            var apik = "vector-tiles-43REfck";
            var tiles = tile
                .scale(zoom.scale())
                .translate(zoom.translate())();
            projection
                .scale(zoom.scale() / p / Math.PI)
                .translate(zoom.translate());
            var imageWater = layerWater
                .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
                .selectAll(".tileWater")
                .data(tiles, function(d){
                    return d;
                });
            imageWater.exit()
                .each(function(d){
                    this._xhr.abort();
                }).remove();
            imageWater.enter().append("svg")
                .attr("class", "tileWater")
                .style("left", function(d){
                    return d[0] * 256 + "px";
                })
                .style("top", function(d){
                    return d[1] * 256 + "px";
                })
                .each(function(d){
                    var svg = d3.select(this);
                    var osmType = "water";
                    var abc = ["a", "b", "c"][(d[0] * 31 + d[1]) % 3];
                    var url = surl + osmType + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".json?api_key="+apik;

                    this._xhr = d3.json(url, function(error, json){
                        var k = Math.pow(2, d[2]) * 256;
                        tilePath.projection()
                            .translate([k / 2 - d[0] * 256, k / 2 - d[1] * 256])
                            .scale(k / 2 / Math.PI);

                        svg.selectAll("path")
                            .data(json.features)
                            .enter().append("path")
                            .attr("class", function(d){
                                return d.properties.kind;
                            })
                            .attr("d", tilePath);
                    });
                });

            var imageRoads = layerRoads
                .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
                .selectAll(".tileRoad")
                .data(tiles, function(d){
                    return d;
                });
            imageRoads.exit()
                .each(function(d){
                    this._xhr.abort();
                }).remove();
            imageRoads.enter().append("svg")
                .attr("class", "tileRoad")
                .style("left", function(d){
                    return d[0] * 256 + "px";
                })
                .style("top", function(d){
                    return d[1] * 256 + "px";
                })
                .each(function(d){
                    var svg = d3.select(this);
                    var osmType = "roads";
                    var abc = ["a", "b", "c"][(d[0] * 31 + d[1]) % 3];
                    var url = surl + osmType + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".json?api_key="+apik;

                    this._xhr = d3.json(url, function(error, json){
                        var k = Math.pow(2, d[2]) * 256;
                        tilePath.projection()
                            .translate([k / 2 - d[0] * 256, k / 2 - d[1] * 256])
                            .scale(k / 2 / Math.PI);

                        svg.selectAll("path")
                            .data(json.features.sort(function(a,b){
                                return a.properties.sort_key - b.properties.sort_key;
                            }))
                            .enter().append("path")
                            .attr("class", function(d){
                                return d.properties.kind;
                            })
                            .attr("d", tilePath);
                    });
                });

            if(!drawBuildings) return;

            var imageBuildings = layerBuildings
                .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
                .selectAll(".tileBuilding")
                .data(tiles, function(d){
                    return d;
                });
            imageBuildings.exit()
                .each(function(d){
                    this._xhr.abort();
                }).remove();
            imageBuildings.enter().append("svg")
                .attr("class", "tileBuilding")
                .style("left", function(d){
                    return d[0] * 256 + "px";
                })
                .style("top", function(d){
                    return d[1] * 256 + "px";
                })
                .each(function(d){
                    var svg = d3.select(this);
                    var osmType = "buildings";
                    var abc = ["a", "b", "c"][(d[0] * 31 + d[1]) % 3];
                    var url = surl + osmType + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".json?api_key="+apik;

                    this._xhr = d3.json(url, function(error, json){
                        var k = Math.pow(2, d[2]) * 256;
                        tilePath.projection()
                            .translate([k / 2 - d[0] * 256, k / 2 - d[1] * 256])
                            .scale(k / 2 / Math.PI);

                        svg.selectAll("path")
                            .data(json.features)
                            .enter().append("path")
                            .attr("class", function(d){
                                return d.properties.kind;
                            })
                            .attr("d", tilePath);
                    });
                });
        }

        function mousemoved(){
            info.text(formatLocation(projection.invert(d3.mouse(this)), zoom.scale()));
        }
        function matrix3d(scale, translate){
            var k = scale / 256;
            var r = scale % 1 ? Number : Math.round;

            return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1]  + ")";
        }
        function prefixMatch(p){
            var i = -1;
            var n = p.length;
            var s = document.body.style;

            while(++i < n){
                if(p[i] + "Transform" in s)
                    return "-" + p[i].toLowerCase() + "-";
                return "";
            }
        }
        function formatLocation(p, k){
            var format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
            return (p[1] < 0 ? format(-p[1]) + "°S" : format(p[1]) + "°N") + " " + (p[0] < 0 ? format(-p[0]) + "°W" : format(p[0]) + "°E");
        }
    }
});

module.exports = Mapa2;
