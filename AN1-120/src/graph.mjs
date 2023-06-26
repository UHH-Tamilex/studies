import Cytoscape from 'cytoscape';
import Fcose from 'cytoscape-fcose';
Cytoscape.use(Fcose);

const cytoStyle =  [{
    selector: 'node',
    style: {
        'background-color': '#666',
        'label': 'data(id)',
        'width': 10,
        'height': 10,
        'font-family': 'Brill'
    }
},
{selector: 'edge',
style: {
    //width: 1,
    width: el => el.data('dice') < 0.2 ? 2 : 1,
    //width: el => 1 + 1/el.data('dice'),
    'line-color': '#ccc',
    //'line-opacity': el => { const scaled = (1-el.data('dice'))*2; return scaled > 1 ? 1 : scaled; },
    'line-opacity': el => (1 - el.data('length')) * 0.8,
    'z-index': 1,
    'events': 'no'
}
},
{selector: '.mst',
style: {
    'line-color': 'rgb(7,48,80)',
    'z-index': 10,
    //'line-opacity': 1
    }
},
{selector: 'node',
style: {
    'background-color': '#2b653c'
    }
},
{selector: ':parent',
style: {
    'background-opacity': 0.333,
    'shape': 'round-rectangle',
    'label': '',
    'border-width': 0
    }
}
];
const go = (data, inflate = 1.2) => {
    const cy = Cytoscape({
        container: document.getElementById('graph'),
        elements: data,
        wheelSensitivify: 0.2,
        layout: {
            name: 'null',
        },
        style: cytoStyle
    });
    const tree = cy.elements().kruskal(edge => 1 - edge.data('length'));
    tree.addClass('mst');
    const others = cy.$('edge').difference(tree);
    others.remove();
    const layout1 = cy.layout({
        name: 'fcose',
        nodeDimensionsIncludeLabels: true,
        randomize: true
    });
    const layout2 = cy.layout({
        name: 'fcose',
        nodeDimensionsIncludeLabels: true,
        randomize: false,
        numIter: 4000,
        quality: 'proof',
        packComponents: true,
        idealEdgeLength: edge => edge.data('length') * 100,
        //edgeElasticity: edge => 50 / edge.data('length')
    });
    layout1.run();
    cy.once('layoutstop',() => {
        others.restore();
        const clusters = cy.elements().markovClustering({
            attributes: [
                edge => edge.data('length')
                ],
            inflateFactor: inflate
        });
        for(let n=0;n<clusters.length;n++) {
            cy.add({
                group: 'nodes',
                data: {id: `cluster${n}`}
            });
            clusters[n].move({parent: `cluster${n}`});
        }
        for(let n=0;n<clusters.length;n++) {
            const cluster = cy.$(`#cluster${n}`);
            if(cluster.children().length === 0) cluster.remove();
        }
        others.remove();
        layout2.run();
    });
};

export default go;
