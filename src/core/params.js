var tabList = [{
      id: 'create',
      label: 'Create',
      vtabs: [{
            id: 'addFood',
            label: 'Add Food'
         },
         {
            id: 'addRecipe',
            label: 'Add Recipe'
         },
         {
            id: 'addMenu',
            label: 'Add Menu'
         },
      ]
   },
   {
      id: 'edit',
      label: 'Edit',
      vtabs: [{
            id: 'viewMenu',
            label: 'View Menu'
         },
         {
            id: 'editMenu',
            label: 'Edit Menu'
         },
         {
            id: 'people',
            label: 'SENCO'
         }, {
            id: 'shopping',
            label: 'Shopping'
         }
      ]
   },
   {
      id: 'admin',
      label: 'Admin',
      vtabs: [{
            id: 't1',
            label: 'Foods'
         },
         {
            id: 't2',
            label: 'Recipes'
         },
         {
            id: 't3',
            label: 'Menus'
         },
         {
            id: 't4',
            label: 'Other'
         }
      ]
   },
];

module.exports = {
   tabList: tabList
};