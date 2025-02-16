const crypto = require('crypto');

function hashRecord(record) {
    return crypto.createHash('sha256').update(record).digest('hex');
}

// Example records (storing their hashes instead of raw data)
const records = [
    hashRecord('record1-data'),
    hashRecord('record2-data'),
    hashRecord('record3-data'),
    hashRecord('record4-data'),
];

console.log(records);

function buildMerkleTree(hashes) {
    if (hashes.length === 1) return hashes[0]; // Root reached

    let treeLevel = [];

    for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left; // Duplicate last if odd number of hashes
        treeLevel.push(hashRecord(left + right));
    }

    return buildMerkleTree(treeLevel);
}

const merkleRoot = buildMerkleTree(records);
console.log("Merkle Root:", merkleRoot);



function getMerkleProof(record, records) {
    let index = records.indexOf(hashRecord(record));
    if (index === -1) return [];

    let proof = [];
    let level = records;

    while (level.length > 1) {
        let newLevel = [];

        for (let i = 0; i < level.length; i += 2) {
            const left = level[i];
            const right = level[i + 1] || left;

            if (i === index || i + 1 === index) {
                proof.push(i === index ? right : left);
            }

            newLevel.push(hashRecord(left + right));
        }

        level = newLevel;
        index = Math.floor(index / 2);
    }

    return proof;
}

// Example:
const proof = getMerkleProof('record2-data', records);
console.log("Proof:", proof);
