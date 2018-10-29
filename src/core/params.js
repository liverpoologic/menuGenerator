var tabList = [{
      id: 'create',
      label: 'Create',
      vtabs: [{
            id: 'addFood',
            label: 'Foods',
            icon: 'lemon'
         },
         {
            id: 'addRecipe',
            label: 'Recipes',
            icon: 'book-open'
         },
         {
            id: 'addMenu',
            label: 'Menus',
            icon: 'utensils'
         },
      ]
   },
   {
      id: 'edit',
      label: 'Edit',
      vtabs: [{
            id: 'viewMenu',
            label: 'View Menu',
            icon: 'file-pdf'
         },
         {
            id: 'editMenu',
            label: 'Edit Menu',
            icon: 'pen'
         },
         {
            id: 'people',
            label: 'SENCO',
            icon: 'user'
         }, {
            id: 'shopping',
            label: 'Shopping',
            icon: 'shopping-basket'
         }
      ]
   },
   {
      id: 'admin',
      label: 'Admin',
      vtabs: [{
            id: 't1',
            label: 'Foods',
            icon: 'lemon'
         },
         {
            id: 't2',
            label: 'Recipes',
            icon: 'book-open'
         },
         {
            id: 't3',
            label: 'Menus',
            icon: 'utensils'
         },
         {
            id: 't4',
            label: 'Other',
            icon: 'wrench'
         }
      ]
   },
];

module.exports = {
   tabList: tabList
};