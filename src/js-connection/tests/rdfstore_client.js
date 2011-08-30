var RDFStoreClient = require("./../src/rdfstore_client.js").RDFStoreClient;

exports.testConnection1 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        test.ok(success);
        test.done();
    });
};

exports.testConnectionIntegration1 = function(test){
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        test.ok(success);
        connection.execute('INSERT DATA {  <http://example/book3> <http://example.com/vocab#title> <http://test.com/example> }', function(result, msg){
            connection.execute('SELECT * { ?s ?p ?o }', function(success,results) {
                test.ok(success === true);
                test.ok(results.length === 1);
                test.ok(results[0].s.value === "http://example/book3");
                test.ok(results[0].p.value === "http://example.com/vocab#title");
                test.ok(results[0].o.value === "http://test.com/example");

                test.done();
            });
        });
    });
};

exports.testConnectionIntegration2 = function(test){
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        connection.execute('INSERT DATA {  <http://example/book3> <http://example.com/vocab#title> <http://test.com/example> }', function(){
            connection.execute('SELECT * { ?s ?p ?o }', function(success,results) {
                test.ok(success === true);
                test.ok(results.length === 1);
                test.ok(results[0].s.value === "http://example/book3");
                test.ok(results[0].p.value === "http://example.com/vocab#title");
                test.ok(results[0].o.value === "http://test.com/example");

                test.done();
            });
        });
    });
};


exports.testConnectionGraph1 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                     PREFIX : <http://example.org/people/>\
                     INSERT DATA {\
                     :alice\
                         rdf:type        foaf:Person ;\
                         foaf:name       "Alice" ;\
                         foaf:mbox       <mailto:alice@work> ;\
                         foaf:knows      :bob ;\
                         .\
                     :bob\
                         rdf:type        foaf:Person ;\
                         foaf:name       "Bob" ; \
                         foaf:knows      :alice ;\
                         foaf:mbox       <mailto:bob@home> ;\
                         .\
                     }';
        connection.execute(query, function(success, results) {
            console.log("CONNECTION:");
            console.log(connection);
            connection.graph(function(success, graph){
                console.log("RESULTS");
                console.log(success);

                var results = graph.filter( connection.rdf.filters.describes("http://example.org/people/alice") );

                var resultsCount = results.toArray().length;

                var resultsSubject = results.filter(connection.rdf.filters.s("http://example.org/people/alice"))
                var resultsObject  = results.filter(connection.rdf.filters.o("http://example.org/people/alice"))
                
                test.ok(resultsObject.toArray().length === 1);
                test.ok((resultsObject.toArray().length + resultsSubject.toArray().length) === resultsCount);

                test.done();
            });
        });
    });
};

exports.testConnectionGraph2 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                     PREFIX : <http://example.org/people/>\
                     INSERT DATA {\
                       GRAPH :alice {\
                         :alice\
                             rdf:type        foaf:Person ;\
                             foaf:name       "Alice" ;\
                             foaf:mbox       <mailto:alice@work> ;\
                             foaf:knows      :bob ;\
                         .\
                       }\
                     }';
        connection.execute(query, function(success, results) {

            var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                         PREFIX : <http://example.org/people/>\
                         INSERT DATA {\
                           GRAPH :bob {\
                              :bob\
                                  rdf:type        foaf:Person ;\
                                  foaf:name       "Bob" ; \
                                  foaf:knows      :alice ;\
                                  foaf:mbox       <mailto:bob@home> ;\
                                  .\
                           }\
                         }'
        connection.execute(query, function(success, results) {

            connection.graph(function(succes, graph){
                test.ok(graph.toArray().length === 0);

                connection.graph("http://example.org/people/alice", function(succes, results) {
                    test.ok(results.toArray().length === 4);
                    test.done();
                });
            });
        });
        });
    });
};

exports.testConnectionSubject1 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                     PREFIX : <http://example.org/people/>\
                     INSERT DATA {\
                     :alice\
                         rdf:type        foaf:Person ;\
                         foaf:name       "Alice" ;\
                         foaf:mbox       <mailto:alice@work> ;\
                         foaf:knows      :bob ;\
                         .\
                     :bob\
                         rdf:type        foaf:Person ;\
                         foaf:name       "Bob" ; \
                         foaf:knows      :alice ;\
                         foaf:mbox       <mailto:bob@home> ;\
                         .\
                     }';
        connection.execute(query, function(success, results) {
            connection.node("http://example.org/people/alice", function(succes, graph){
                console.log("HEY");
                console.log(graph);
                test.ok(graph.toArray().length === 4);
                test.done();
            });
        });
    });
};

exports.testConnectionSubject2 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                     PREFIX : <http://example.org/people/>\
                     INSERT DATA {\
                       GRAPH :alice {\
                         :alice\
                             rdf:type        foaf:Person ;\
                             foaf:name       "Alice" ;\
                             foaf:mbox       <mailto:alice@work> ;\
                             foaf:knows      :bob ;\
                         .\
                       }\
                     }';
        connection.execute(query, function(success, results) {

            var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                         PREFIX : <http://example.org/people/>\
                         INSERT DATA {\
                           GRAPH :bob {\
                              :bob\
                                  rdf:type        foaf:Person ;\
                                  foaf:name       "Bob" ; \
                                  foaf:knows      :alice ;\
                                  foaf:mbox       <mailto:bob@home> ;\
                                  .\
                           }\
                         }'
        connection.execute(query, function(success, results) {

            connection.graph(function(succes, graph){
                test.ok(graph.toArray().length === 0);

                connection.node("http://example.org/people/alice", "http://example.org/people/alice", function(success, results) {

                    test.ok(results.toArray().length === 4);
                    test.done();
                });
            });
        });
        });
    });
};


exports.testConnectionPrefixes = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                     PREFIX : <http://example.org/people/>\
                     INSERT DATA {\
                       GRAPH :alice {\
                         :alice\
                             rdf:type        foaf:Person ;\
                             foaf:name       "Alice" ;\
                             foaf:mbox       <mailto:alice@work> ;\
                             foaf:knows      :bob ;\
                         .\
                       }\
                     }';

        connection.execute(query, function(success, results) {

            var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                         PREFIX : <http://example.org/people/>\
                         INSERT DATA {\
                           GRAPH :bob {\
                              :bob\
                                  rdf:type        foaf:Person ;\
                                  foaf:name       "Bob" ; \
                                  foaf:knows      :alice ;\
                                  foaf:mbox       <mailto:bob@home> ;\
                                  .\
                           }\
                         }'
        connection.execute(query, function(success, results) {

            connection.setPrefix("ex", "http://example.org/people/");
            connection.graph(function(succes, graph){
                test.ok(graph.toArray().length === 0);

                connection.node("ex:alice", "ex:alice", function(success, results) {

                    test.ok(results.toArray().length === 4);
                    test.done();
                });
            });
        });
        });
    });
};


exports.testConnectionDefaultPrefix = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                     PREFIX : <http://example.org/people/>\
                     INSERT DATA {\
                       GRAPH :alice {\
                         :alice\
                             rdf:type        foaf:Person ;\
                             foaf:name       "Alice" ;\
                             foaf:mbox       <mailto:alice@work> ;\
                             foaf:knows      :bob ;\
                         .\
                       }\
                     }';
        connection.execute(query, function(success, results) {

            var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                         PREFIX : <http://example.org/people/>\
                         INSERT DATA {\
                           GRAPH :bob {\
                              :bob\
                                  rdf:type        foaf:Person ;\
                                  foaf:name       "Bob" ; \
                                  foaf:knows      :alice ;\
                                  foaf:mbox       <mailto:bob@home> ;\
                                  .\
                           }\
                         }'
        connection.execute(query, function(success, results) {

            connection.setDefaultPrefix("http://example.org/people/");
            connection.graph(function(succes, graph){
                test.ok(graph.toArray().length === 0);

                connection.node(":alice", ":alice", function(success, results) {

                    test.ok(results.toArray().length === 4);
                    test.done();
                });
            });
        });
        });
    });
};

exports.testConnectionInsert1 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        connection.setPrefix("ex", "http://example.org/people/");

        var graph = connection.rdf.createGraph();
        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                    connection.rdf.createNamedNode(connection.rdf.resolve("foaf:name")),
                                    connection.rdf.createLiteral("alice") ));;

        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                          connection.rdf.createNamedNode(connection.rdf.resolve("foaf:knows")),
                                          connection.rdf.createNamedNode(connection.rdf.resolve("ex:Bob")) ));

        
        connection.insert(graph, function(success, results){

            connection.node("ex:Alice", function(success, graph) {
                test.ok(graph.toArray().length === 2);
                test.done();
            });
            
        });
    });
};

exports.testConnectionInsert2 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        connection.setPrefix("ex", "http://example.org/people/");

        var graph = connection.rdf.createGraph();
        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("foaf:name")),
                                               connection.rdf.createLiteral("alice") ));;

        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("foaf:knows")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("ex:Bob")) ));

        
        connection.insert(graph, "ex:alice", function(success, results){

            connection.node("ex:Alice", "ex:alice", function(success, graph) {
                test.ok(graph.toArray().length === 2);
                test.done();
            });
            
        });
    });
};

exports.testConnectionDelete1 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        connection.setPrefix("ex", "http://example.org/people/");

        var graph = connection.rdf.createGraph();
        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("foaf:name")),
                                               connection.rdf.createLiteral("alice") ));;

        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("foaf:knows")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("ex:Bob")) ));

        
        connection.insert(graph, function(success, results){

            connection.node("ex:Alice", function(success, graph) {
                test.ok(graph.toArray().length === 2);
                connection.delete(graph, function(success, result) {
                    connection.node("ex:Alice", function(success, graph){
                        test.ok(graph.toArray().length === 0);
                        test.done();
                    })
                });

            });
            
        });
    });
};

exports.testConnectionDelete2 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        connection.setPrefix("ex", "http://example.org/people/");

        var graph = connection.rdf.createGraph();
        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("foaf:name")),
                                               connection.rdf.createLiteral("alice") ));;

        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("foaf:knows")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("ex:Bob")) ));

        
        connection.insert(graph, "ex:alice", function(success, results){

            connection.node("ex:Alice", "ex:alice", function(success, graph) {
                test.ok(graph.toArray().length === 2);
                connection.delete(graph, "ex:alice", function(success, result) {
                    connection.node("ex:Alice", function(success, graph){
                        test.ok(graph.toArray().length === 0);
                        test.done();
                    })
                });

            });
            
        });
    });
};

exports.testConnectionClear = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        
        connection.setPrefix("ex", "http://example.org/people/");

        var graph = connection.rdf.createGraph();
        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("foaf:name")),
                                               connection.rdf.createLiteral("alice") ));;

        graph.add(connection.rdf.createTriple( connection.rdf.createNamedNode(connection.rdf.resolve("ex:Alice")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("foaf:knows")),
                                               connection.rdf.createNamedNode(connection.rdf.resolve("ex:Bob")) ));

        
        connection.insert(graph, "ex:alice", function(success, results){

            connection.node("ex:Alice", "ex:alice", function(success, graph) {
                test.ok(graph.toArray().length === 2);
                connection.clear("ex:alice", function(success, result) {
                    connection.node("ex:Alice", function(success, graph){
                        test.ok(graph.toArray().length === 0);
                        test.done();
                    })
                });

            });
            
        });
    });
};

exports.testConnectionLoad1 = function(test) {
    new RDFStoreClient.RDFStoreClient(__dirname+"/../src/rdfstore_worker.js", [], function(success,connection) {
        
        connection.setPrefix("ex", "http://example.org/people/");

        var graph = connection.rdf.createGraph();

        input = {
              "@context": 
              {  
                 "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                 "xsd": "http://www.w3.org/2001/XMLSchema#",
                 "name": "http://xmlns.com/foaf/0.1/name",
                 "age": "http://xmlns.com/foaf/0.1/age",
                 "homepage": "http://xmlns.com/foaf/0.1/homepage",
                 "ex": "http://example.org/people/",
                 "@type":
                 {
                    "xsd:integer": "age",
                    "xsd:anyURI": "homepage",
                 }
              },
              "@": "ex:john_smith",
              "name": "John Smith",
              "age": "41",
              "homepage": "http://example.org/home/"
            };
        connection.load("application/json", input, "ex:test", function(success, results){
              connection.node("ex:john_smith", "ex:test", function(success, graph) {
                  test.ok(graph.toArray().length === 3);
                  test.done();
              });
        });
    });
};

/**
 * dbpedia is DOWN!!!
 **
exports.testLoad2 = function(test) {
    new RDFStoreClient.RDFStoreClient("/Users/antonio/Development/Projects/js/rdfstore-js/src/js-connection/src/rdfstore_worker.js", [], function(success, connection) {
        connection.load('remote', 'http://dbpedia.org/resource/Tim_Berners-Lee', function(success, result) {
            connection.node('http://dbpedia.org/resource/Tim_Berners-Lee', function(success, graph){
                test.ok(success);
                var results = graph.filter(connection.rdf.filters.type(connection.rdf.resolve("foaf:Person")));
                test.ok(results.toArray().length === 1);
                test.done();
            });
        });
    });
};


exports.testEventsAPI1 = function(test){
    var counter = 0;
    new RDFStoreClient.RDFStoreClient("/Users/antonio/Development/Projects/js/rdfstore-js/src/js-connection/src/rdfstore_worker.js", [], function(success, connection) {
        connection.execute('INSERT DATA {  <http://example/book> <http://example.com/vocab#title> <http://test.com/example> }', function(result, msg){
            connection.startObservingNode("http://example/book",function(graph){
                var observerFn = arguments.callee;
                if(counter === 0) {
                    counter++;
                    test.ok(graph.toArray().length === 1);
                    connection.execute('INSERT DATA {  <http://example/book> <http://example.com/vocab#title2> <http://test.com/example2> }');
                } else if(counter === 1) {
                    counter++;
                    test.ok(graph.toArray().length === 2);
                    connection.execute('DELETE DATA {  <http://example/book> <http://example.com/vocab#title2> <http://test.com/example2> }');
                } else if(counter === 2) {
                    counter++;
                    test.ok(graph.toArray().length === 1);
                    connection.stopObservingNode(observerFn);
                    connection.execute('INSERT DATA {  <http://example/book> <http://example.com/vocab#title2> <http://test.com/example3> }');                    
                    test.done();
                } else if(counter === 3) {
                    test.ok(false);
                }
            });
        });
    });
};
*/