const nestedTreeMock = [
  {
    id: '1',
    children: [
      {
        id: '1.1',
        children: [
          {
            id: '1.1.1',
            children: []
          }
        ]
      },
    ]
  },
  {
    id: '2',
    children: [
      {
        id: '2.1',
        children: [],
      }, {
        id: '2.2',
        children: [],
      },
    ],
  }
]


const groupedActions = {
  "1": new Array(7).map(item => {}),
  "1.1.1": [{}, {}, {}],
  "2.1": [{}, {}, {}],
  "2.2": [{}, {}]
}

const getTaskAmountForId = (searchId, actionGroup) => {
  if (!actionGroup[searchId]) {
    return 0;
  }
  return actionGroup[searchId].length;
}

const getIndicesFunctional = (nodes, tasks) => {
  const getCountsForAllChildren = (entry) => {
    const { children, id: rootId } = entry;

    const allChildIndices = children.reduce((accumulator, currentChild) => {
      if (!currentChild.children || !currentChild.children.length) {
        const totalForCurrentEntry = getTaskAmountForId(currentChild.id, tasks);
        return {
          total: accumulator.total + totalForCurrentEntry,
          indices: {
            ...accumulator.indices,
            [currentChild.id]: totalForCurrentEntry
          }
        };
      }
      const childCounts = getCountsForAllChildren(currentChild);
      return {
        total: accumulator.total + childCounts.total,
        indices: {
          ...childCounts.indices,
          [currentChild.id]: childCounts.total + getTaskAmountForId(currentChild.id, tasks), // if tasks at all levels
        }
      };
    }, {
      total: 0,
      indices: {},
    });

    return {
      total: allChildIndices.total,
      indices: {
        ...allChildIndices.indices,
        [rootId]: allChildIndices.total + getTaskAmountForId(rootId, tasks),
      }
    }
  }

  const result = nodes.reduce((acc, currentEntry) => {
    const { indices, total } = getCountsForAllChildren(currentEntry);
    return {
      ...indices,
      ...acc,
    }
  }, {});
  return result;
}

const getGlobalIndicesImperative = (nodes, tasks) => {
  const globalIndices = {};

  const addToIndices = (id, total) => {
    globalIndices[id] = total;
  }

  const getCountsForAllChildren = (entry) => {
    const { children, id: rootId } = entry;

    const allChildrenAmount = children.reduce((total, currentChild) => {
      const totalForCurrentEntry = getTaskAmountForId(currentChild.id, tasks);

      if (!currentChild.children || !currentChild.children.length) {
        addToIndices(currentChild.id, totalForCurrentEntry);
        return total + totalForCurrentEntry;
      }

      const childCounts = getCountsForAllChildren(currentChild);
      const currentPlusChildren = childCounts + totalForCurrentEntry;
      addToIndices(currentChild.id, currentPlusChildren);
      return total + currentPlusChildren;
    }, 0);

    const rootTotal = allChildrenAmount + getTaskAmountForId(rootId, tasks);
    addToIndices(rootId, rootTotal);

    return rootTotal;
  }

  nodes.forEach(entry => getCountsForAllChildren(entry));
  return globalIndices;
}

/**
 * It was at this point we wanted to try Mw's own solution.
 * - Copy pasted from slack
 * - No errors
 * - Pasted straight into JSPerf
 * - Cryptic errors, line numbers mentioned
 * - Nothing seems wrong in editor
 * - Install and configure ESLint locally
 * - Spotted a ghost (newline?) character that wasn't compatible and invisibly breaking the code
 * - Code works
 * - WTF code seemingly looked way faster
 * - Code was slower
 * - Tried fixing immediate bugs
 * - Made the code even worse???
 * - Using a closure somehow speeds it up
 * - Adding conditionals made it slightly faster
 * 
 * ... 
 * 
 * At this point we decided to remove the console.log and JSON.stringify from the JSPerf test cases
 * wow... turns out this was choking all of the tests. 
 * 
 * Results 
 * 
 */

/** OOPS */

const getChildTasksCount = (node, tasks) => {
    let currentCount;

    if (tasks[node.id] && tasks[node.id].length) {
      currentCount = tasks[node.id].length;
    } else {
      currentCount = 0;
    }
  
    const childCounts = node.children.reduce((childCounts, child) => {
      const count = getChildTasksCount(child, tasks);
      currentCount += count[child.id];
  
      return {
        ...childCounts,
        ...count,
      }
    }, {})
  
    return {
      ...childCounts,
      [node.id]: currentCount,
    };
}

const getGlobalIndicesMw = (nodes, tasks) => {
  return nodes.reduce((counts, node) => {
    const nodeCounts = getChildTasksCount(node, tasks);
    return {
      ...counts,
      ...nodeCounts,
    };
  }, {})
}

/** YAY */

const getChildTasksCount2 = (node, tasks) => {
    let currentCount;

    if (tasks[node.id] && tasks[node.id].length) {
      currentCount = tasks[node.id].length;
    } else {
      currentCount = 0;
    }
  
    const childCounts = node.children.reduce((acc, child) => {
      const count = getChildTasksCount(child, tasks);
      currentCount += count[child.id];
  
      return {
        ...acc,
        ...count,
      }
    }, {})
  
    return {
      ...childCounts,
      [node.id]: currentCount,
    };
}

const getGlobalIndicesMw2 = (nodes, tasks) => {
  return nodes.reduce((counts, node) => {
    const nodeCounts = getChildTasksCount2(node, tasks);
    return {
      ...counts,
      ...nodeCounts,
    };
  }, {})
}

/** Attempt 3 - Closures */

const getGlobalIndicesMw3 = (nodes, tasks) => {
  const getChildTasksCount = (node) => {
    let currentCount;

    if (tasks[node.id] && tasks[node.id].length) {
      currentCount = tasks[node.id].length; 1
    } else {
      currentCount = 0;
    }

    const childCounts = node.children.reduce((acc, child) => {
      const count = getChildTasksCount(child);
      currentCount += count[child.id];

      return {
        ...acc,
        ...count,
      }
    }, {})

    return {
      ...childCounts,
      [node.id]: currentCount,
    };
  }

  return nodes.reduce((counts, node) => {
    const nodeCounts = getChildTasksCount(node);
    return {
      ...counts,
      ...nodeCounts,
    };
  }, {})
}

/** Attempt 4 - Conditional checks */

const getGlobalIndicesMw4 = (nodes, tasks) => {
  const getChildTasksCount = (node) => {
    let currentCount = 0;

    if (tasks[node.id] && tasks[node.id].length) {
      currentCount = tasks[node.id].length; 1
    }

    if (!node.children || !node.children.length) {
      return {}
    }

    const childCounts = node.children.reduce((acc, child) => {
      const count = getChildTasksCount(child);
      currentCount += count[child.id];

      return {
        ...acc,
        ...count,
      }
    }, {})

    return {
      ...childCounts,
      [node.id]: currentCount,
    };
  }

  return nodes.reduce((counts, node) => {
    const nodeCounts = getChildTasksCount(node);
    return {
      ...counts,
      ...nodeCounts,
    };
  }, {})
}
