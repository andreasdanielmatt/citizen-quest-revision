const findCycle = require('find-cycle/directed');

function checkCyclesInDialogue(dialogue) {
  // Assign a unique id (incremental) to each node in dialogue.nodes
  const ids = {};
  dialogue.nodes.forEach((node, index) => {
    ids[node.id] = index;
  });

  // Create a directed graph from the dialogue
  const graph = new Map();
  dialogue.nodes.forEach((node, index) => {
    const connectedNodes = [];
    if (node.then !== undefined) {
      connectedNodes.push(node.then);
    }
    if (node.responses !== undefined) {
      node.responses.forEach((response) => {
        if (response.then) {
          connectedNodes.push(response.then);
        }
      });
    }
    if (node.items !== undefined) {
      node.items.forEach((item) => {
        connectedNodes.push(item.id);
      });
    }
    if (node.then === undefined && node.parent && node.parent.type === 'sequence') {
      // Find the next sibling node
      const nextSiblingIndex = node.parent.items.findIndex((item) => item.id === node.id) + 1;
      if (nextSiblingIndex < node.parent.items.length) {
        connectedNodes.push(node.parent.items[nextSiblingIndex].id);
      }
    }

    graph.set(index, connectedNodes.map((id) => ids[id]));
  });

  // Find cycles in the graph
  const startNodes = new Set([0]);
  const getConnectedNodes = ((index) => graph.get(index));
  const cycle = findCycle(startNodes, getConnectedNodes);
  if (cycle && cycle.length > 0) {
    throw new Error(`Dialogue contains a cycle: ${cycle.map((index) => dialogue.nodes[index].id).join(' -> ')}`);
  }
}

module.exports = checkCyclesInDialogue;
