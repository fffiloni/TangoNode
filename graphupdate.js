// Initialize Firebase
var config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};
firebase.initializeApp(config);
var database = firebase.database();

var graph;
var selected = false;
var editing = 0;
var toDelete;

function myGraph() {

  // Add and remove elements on the graph object
  this.addNode = function (id, r) {
      nodes.push({"id": id, "r": r});
      charge();
      update();
  };

  this.removeNode = function (id) {
      var i = 0;
      var n = findNode(id);
      while (i < links.length) {
          if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
              links.splice(i, 1);
          }
          else i++;
      }
      nodes.splice(findNodeIndex(id), 1);
      update();
  };

  this.removeLink = function (source, target) {
      for (var i = 0; i < links.length; i++) {
          if (links[i].source.id == source && links[i].target.id == target) {
              links.splice(i, 1);
              break;
          }
      }
      update();
  };

  this.consoleLinks = function () {
      console.log(links);
  };

  this.grabData = function () {
    var graphName = document.getElementById("GraphName").value;
    if (graphName == ""){
      graphName = "noname";
    }
    var grabbedData = {
      name: graphName,
      nodes: nodes,
      links: links
    }
      return grabbedData;
  };

  this.consoleNodes = function () {
      console.log(nodes);
  };

  this.getNodes = function () {
      return nodes;
  };

  this.removeallLinks = function () {
      links.splice(0, links.length);
      update();
  };

  this.removeAllNodes = function () {
      nodes.splice(0, nodes.length);
      update();
  };

  this.addLink = function (source, target, value) {
      links.push({"source": findNode(source), "target": findNode(target), "value": value});
      update();
  };

  var findNode = function (id) {
      for (var i in nodes) {
          if (nodes[i]["id"] === id) {return nodes[i];}
      };
  };

  var findNodeIndex = function (id) {
      for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].id == id) {
              return i;
          }
      };
  };

  // set up the D3 visualisation in the specified element
  var w = 650,
      h = 600;

  var color = d3.scale.category10();
  //V4: var color = d3.scaleOrdinal(d3.schemeCategory20);

  var vis = d3.select("svg")

          .attr("width", w)
          .attr("height", h)
          .attr("id", "svg")
          .on("dblclick", clickCanvas)
          .attr("pointer-events", "all")
          .attr("viewBox", "0 0 " + w + " " + h)
          .attr("perserveAspectRatio", "xMinYMid")

          .call(d3.behavior.zoom().on("zoom", function () {
            vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
          }))
          .on("dblclick.zoom", null)
          .append('svg:g');


  function drag(){
    return force.drag()
       // .origin(function(d) { return d; })
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);
  }

  function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

  function dragged(d) {
      d3.select(this).attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
  }

  function dragended(d) {
      d3.select(this).classed("dragging", false);
  }


  var force = d3.layout.force();

  var nodes = force.nodes(),
      links = force.links();

  this.optionIn = function (){
    var selectS = document.getElementById('selectS');
    var selectT = document.getElementById('selectT');
    var selectP = document.getElementById('selectP');
    selectT.innerHTML = "";
    selectS.innerHTML = "";
    selectP.innerHTML = "";

    for (var k = 0; k < nodes.length; k++){
      var optS = document.createElement('option');
      optS.value = nodes[k].id;
      optS.innerHTML = nodes[k].id;
      selectS.appendChild(optS);
      var optT = document.createElement('option');
      optT.value = nodes[k].id;
      optT.innerHTML = nodes[k].id;
      selectT.appendChild(optT);
      var optP = document.createElement('option');
      optP.value = nodes[k].id;
      optP.innerHTML = nodes[k].id;
      selectP.appendChild(optP);
    }
  }


  var update = function () {
    var link = vis.selectAll("line")
            .data(links, function (d) {
                return d.source.id + "-" + d.target.id;
            });

    link.enter().append("line")
            .attr("id", function (d) {
                return d.source.id + "-" + d.target.id;
            })
            .attr("stroke-width", function (d) {
                return /*d.value / 6*/ 4;
            })
            .style("stroke", "#000")
            .attr("class", "link")
            .call(force.drag() //-calls the drag on the nodes
        .on("drag", function(d) { drag() }))

            .on("dblclick", clickErase);
    link.append("title")
            .text(function (d) {
                return d.value;
            });
    link.exit().remove();



    var node = vis.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id;
            });

    var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(force.drag)
            .on("click", click)
            .on("dblclick", dblclick);

    nodeEnter.append("svg:circle")
            .attr("r", function(d){return d.r})
            .attr("id", function (d) {
                return "Node;" + d.id;
            })
            .attr("class", "nodeStrokeClass")
            .attr("fill", 'white'/*function(d) { return color(d.id); }*/)
            .on("mouseover", function(d){
              toDelete = "";
              toDelete = d.id;
              //console.log(toDelete);

              document.addEventListener('keydown', (event) => {
                const keyName = event.key;

                if (keyName === 'Control') {
                  // do not alert when only Control key is pressed.
                  return;
                }
                if (event.ctrlKey) {
                  // Even though event.key is not 'Control' (i.e. 'a' is pressed),
                  // event.ctrlKey may be true if Ctrl key is pressed at the time.
                  if (keyName === 'd') {
                    // do not alert when only Control key is pressed.
                    if (toDelete !== ""){
                      graph.removeNode(toDelete);
                      toDelete = "";
                    }

                    //graph.addLink(nn, 'Sophia', '20');
                    keepNodesOnTop();
                  }
                }
              }, false);

            })
            .on("mouseout", function(d){

              toDelete = "";

              })
            .on("contextmenu", function(d){
              if (!selected) {
                d3.select(this).attr('fill', '#000');
                selected = !selected; editing = 1;
              } else if (selected && editing == 1){
                d3.selectAll('circle').attr('fill', '#fff');
                selected = !selected; editing = 0;
              }

              contextmenu(d);
              clickCanvas();
            });

    nodeEnter.append("svg:text")
            .attr("class", "textClass hide")
            .attr("x", 14)
            .attr("y", ".31em")
            .text(function (d) {
                return d.id;
            });

    node.exit().remove();

    force.on("tick", function () {

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        link.attr("x1", function (d) {
            return d.source.x;
        })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
    });

    // Restart the force layout.
    force
            .gravity(.5)
            .charge(-3000)
            .friction(.7)
            .linkDistance( function(d) { return d.value * 2 } )
            .size([w-w/16, h])
            .start();
  };


  // Make it all go
  update();
}

function drawGraph() {

    graph = new myGraph("#svgdiv");

    // d3.json("./testData.json", function(data) {
    //   var tab = data.nodes;
    //   var liens = data.links;
    //
    //   for (var i = 0; i < tab.length; i++){
    //     graph.addNode(tab[i].id, tab[i].r);
    //     charge();
    //   }
    //
    //   for (var j = 0; j < liens.length; j++){
    //     graph.addLink(liens[j].source, liens[j].target, liens[j].value);
    //     //graph.addLink(liens[j].source, 'Sophia', liens[j].value);
    //     keepNodesOnTop()
    //   }
    // })

    graph.addNode('node1', 12);
    graph.addNode('node2', 12);
    keepNodesOnTop();

    // callback for the changes in the network
    var step = -1;
    function nextval()
    {
        step++;
        return 2000 + (1500*step); // initial time, wait time
    }

    setTimeout(function() {
        graph.addLink('node1', 'node2', '20');
        keepNodesOnTop();
    }, nextval());

}


drawGraph();

// because of the way the network is created, nodes are created first, and links second,
// so the lines were on top of the nodes, this just reorders the DOM to put the svg:g on top
function keepNodesOnTop() {
    $(".nodeStrokeClass").each(function( index ) {
        var gnode = this.parentNode;
        gnode.parentNode.appendChild(gnode);
    });
}
function addNodes() {
    d3.select("svg")
            .remove();
     drawGraph();
}

function addNewNode() {
  var nn = document.getElementById("NodeValue").value;
  var r = document.getElementById("nSize").value;
  graph.addNode(nn, r);
  //graph.addLink(nn, 'Sophia', '20');
  keepNodesOnTop();
  document.getElementById("NodeValue").value = "";
}

function btnrmNode() {
  var rid = document.getElementById("selectP").value;
  graph.removeNode(rid);
  charge();
  keepNodesOnTop();
}

function charge(){
  graph.optionIn();
}

function bind() {
  var sourget = document.getElementById("selectS").value;
  var targsou = document.getElementById("selectT").value;

  graph.addLink(sourget, targsou, 12);
  keepNodesOnTop();
}

function unbind() {
  var sourget = document.getElementById("selectS").value;
  var targsou = document.getElementById("selectT").value;
  graph.removeLink(sourget, targsou);
  graph.removeLink(targsou, sourget);
  keepNodesOnTop();
}

function clickErase(d) {
  graph.removeLink(d.source.id, d.target.id);
  keepNodesOnTop();
}

function click(d){
  var bid = d.id;
  document.getElementById("selectP").value = bid;

}

function contextmenu(d){
  d3.event.preventDefault();

  var bid = d.id;

  document.getElementById("selectS").value = bid;
}

function dblclick(d){

  d3.event.preventDefault();

  var tbid = d.id;
  document.getElementById("selectT").value = tbid;
  if(selected = true){
    var bid = document.getElementById("selectS").value;
  }
  if (!bid == ""){
    graph.addLink(bid, tbid, d.r*2);
  }

  keepNodesOnTop();
}

function clickCanvas(){
  if(!selected){
    document.getElementById("selectS").value = "";
    selected = false;
  } else { selected = true; }
}

function addRandom(r) {

  function makeid() {
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

   for (var i = 0; i < 5; i++)
     text += possible.charAt(Math.floor(Math.random() * possible.length));

   return text;
 }

 var randnode = makeid();

  // var r = document.getElementById("nSize").value;
  graph.addNode(randnode, r);
  //graph.addLink(nn, 'Sophia', '20');
  keepNodesOnTop();
}


function keyAdd(){
    document.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if (keyName === 'Control') {
      // do not alert when only Control key is pressed.
      return;

    }
    if (event.ctrlKey) {
      // Even though event.key is not 'Control' (i.e. 'a' is pressed),
      // event.ctrlKey may be true if Ctrl key is pressed at the time.
      if (keyName === 'n') {
        // do not alert when only Control key is pressed.
        addRandom(12);
        //graph.addLink(nn, 'Sophia', '20');
        keepNodesOnTop();
      }
    }
  }, false);
}
keyAdd();


function keyDel(toDelete){

      graph.removeNode(toDelete);
      console.log(toDelete);
      //graph.addLink(nn, 'Sophia', '20');
      keepNodesOnTop();

}

function deleteAll(){
  graph.removeallLinks();
  graph.removeAllNodes();
  charge();
}

function deleteLinks(){
  graph.removeallLinks();
  charge();
}

function consoleLinks(){
  graph.consoleLinks();
}

function consoleNodes(){
  graph.consoleNodes();
}

function sendToDB(){
  var ref = database.ref('tangotree');
  //ref.remove();
  var datanodes = graph.grabData();
  ref.push(datanodes);
}


function getFromDB(){
  var ref = database.ref('tangotree');
  ref.on('value', gotData, errData);
}

function gotData(data){
  //clear the listing
  var removeli = document.getElementsByClassName('listing');
  while(removeli[0]){removeli[0].parentNode.removeChild(removeli[0]);}

  var graphData = data.val();
  var keys = Object.keys(graphData);
  var list = document.getElementById("graphlist");

  console.log(keys);

  for (var i = 0; i < keys.length; i++){
    var k = keys[i];
    var listel = document.createElement("li");
    listel.setAttribute("class", "listing");
    list.append(listel);
    var klink = document.createElement("a");
    klink.setAttribute("id", k);
    klink.setAttribute("href", "#");
    klink.innerHTML = graphData[k].name;
    klink.setAttribute("onclick", "showLeGraph(this)");
    listel.append(klink);

    var krmlink = document.createElement("a");
    krmlink.setAttribute("id", k);
    krmlink.setAttribute("href", "#");
    krmlink.innerHTML = " X";
    krmlink.setAttribute("onclick", "removeLeGraph(this)");
    listel.append(krmlink);

    // var dbnodes = graphData[k].nodes;
    // for (j = 0; j < dbnodes.length; j++){
    //   graph.addNode(dbnodes[j].id, dbnodes[j].r);
    // }
    // var dblinks = graphData[k].links;
    // for (l = 0; l < dblinks.length; l++){
    //   graph.addLink(dblinks[l].source.id, dblinks[l].target.id, dblinks[l].value);
    //   keepNodesOnTop();
    // }

  }

}

function errData(err){
  console.log('Error!');
  console.log(err);
}

function showLeGraph(elem){
  var key = elem.id;
  var ref = database.ref('tangotree/' + key);
  ref.on('value', oneGraph, errData);

  function oneGraph(data){

    document.getElementById('GraphID').value = key;
    var soloGraph = data.val();
    deleteAll();
    console.log(soloGraph);
    document.getElementById('GraphName').value = soloGraph.name;
    var dbnodes = soloGraph.nodes;
    for (j = 0; j < dbnodes.length; j++){
      graph.addNode(dbnodes[j].id, dbnodes[j].r);
    }
    if (soloGraph.links){
      var dblinks = soloGraph.links;
      for (l = 0; l < dblinks.length; l++){
        graph.addLink(dblinks[l].source.id, dblinks[l].target.id, dblinks[l].value);
        keepNodesOnTop();
      }
    }


  }
}

function updateToDB(){
  var key = document.getElementById('GraphID').value;
  var datanodes = graph.grabData();
  var ref = database.ref('tangotree/' + key);
  ref.update(datanodes);
}

function removeLeGraph(elem){
  var key = elem.id;
  var ref = database.ref('tangotree/' + key);
  ref.remove();
}

getFromDB();
