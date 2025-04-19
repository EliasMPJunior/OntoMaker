/**
 * Converts the entity and relationship graph into a JSON schema in OntoBDC format
 */
export const exportSchema = (nodes, edges) => {
  // Basic structure of OntoBDC schema with expanded context
  const schema = {
    "@context": {
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "label": "rdfs:label",
      "comment": "rdfs:comment",
      "domain": "rdfs:domain",
      "range": "rdfs:range"
    },
    "@graph": []
  };

  // Process entities (nodes)
  nodes.forEach(node => {
    if (node.type === 'entityNode') {
      const entity = {
        "@id": node.data.uri || `http://example.org/entity/${node.id}`,
        "@type": "owl:Class",
        "label": [
          { "@value": node.data.label, "@language": "pt-br" },
          { "@value": node.data.label, "@language": "en" }
        ],
        "comment": [
          { "@value": node.data.description?.["pt-br"] || "", "@language": "pt-br" },
          { "@value": node.data.description?.["en"] || "", "@language": "en" }
        ]
      };

      // Add entity properties
      if (node.data.properties && node.data.properties.length > 0) {
        entity.properties = node.data.properties.map(prop => ({
          "@id": `${entity["@id"]}/property/${prop.name}`,
          "@type": "owl:DatatypeProperty",
          "domain": { "@id": entity["@id"] },
          "range": { "@id": mapTypeToXSD(prop.type) },
          "label": [
            { "@value": prop.label?.["pt-br"] || prop.name, "@language": "pt-br" },
            { "@value": prop.label?.["en"] || prop.name, "@language": "en" }
          ]
        }));
      }

      schema["@graph"].push(entity);
    }
  });

  // Process relationships (edges)
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      const relationship = {
        "@id": `http://example.org/relation/${edge.id}`,
        "@type": "owl:ObjectProperty",
        "label": [
          { "@value": edge.data?.label || "has_property", "@language": "pt-br" },
          { "@value": edge.data?.label || "has_property", "@language": "en" }
        ],
        "domain": { "@id": sourceNode.data.uri || `http://example.org/entity/${sourceNode.id}` },
        "range": { "@id": targetNode.data.uri || `http://example.org/entity/${targetNode.id}` }
      };
      
      schema["@graph"].push(relationship);
    }
  });

  return schema;
};

// Map data types to XSD
const mapTypeToXSD = (type) => {
  const typeMap = {
    'string': 'xsd:string',
    'number': 'xsd:decimal',
    'boolean': 'xsd:boolean',
    'date': 'xsd:dateTime',
    'object': 'xsd:anyURI',
    'array': 'xsd:string'
  };
  
  return typeMap[type] || 'xsd:string';
};