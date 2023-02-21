module.exports = [
    {
        type: 'CV',
        directions: [
            {x: [0,1,1,2,3], y: [0,0,-1,0,0]},
            {x: [0,0,-1,0,0], y: [0,1,1,2,3]},
        ]
    },
    {
        type: 'BB',
        directions: [
            {x: [0,1,2,3], y: [0,0,0,0]},
            {x: [0,0,0,0], y: [0,1,2,3]}
        ]
    },
    {
        type: 'CA',
        directions: [
            {x: [0,1,2], y: [0,0,0]},
            {x: [0,0,0], y: [0,1,2]}
        ]
    },
    {
        type: 'OR',
        directions: [
            {x: [0,1,0,1], y: [0,0,1,1]}
        ]
    },
    {
        type: 'DD',
        directions: [
            {x: [0,1], y: [0,0]},
            {x: [0,0], y: [0,1]}
        ]
    }
];