(function( window ) {
	'use strict';

  var $filter, $list, $template, filter, status, NavHelper;

  NavHelper = {'': 0, 'active': 1, 'completed': 2}
  $list = $('#todo-list');
  $template = $('#todo-template').children(0);

  function updateTodo(element, updateBlock) {
    var $todo, index;
    $todo = $(element).parents('li');
    if (filter !== '') {
      index = $filter.children().index($todo);
      $todo = $list.children()[filter === 'active' ? 'not' : 'filter']('.completed').eq(index);
    }
    updateBlock($todo, element);
    $(document).triggerHandler('save');
  }

  $(document).on('load', function() {
    $list.show().html(localStorage.getItem('just-jquery-todomvc'));
    if ($filter) $filter.remove();
    filter = window.location.href.split('#/')[1];
    status = {
      total: $list.children().length,
      complete: $list.find('.completed').length,
      remaining: $list.children().not('.completed').length
    };
    $('#main, #footer')[status.total === 0 ? 'hide' : 'show']();
    $('#toggle-all')[status.total > 0 && status.remaining == 0 ? 'prop' : 'removeAttr']('checked', 'checked');
    if (status.total === 0) return;
    $('#filters li a').each(function(index) {
      $(this).toggleClass('selected', index === NavHelper[filter]);
    });
    $('#todo-count').find('strong').text(status.remaining)
    $('#clear-completed').html(status.complete == 0 ? '' : 'Clear completed (' + status.complete + ')');
  });

  $(document).on('save', function() {
    localStorage.setItem('just-jquery-todomvc', $list.html());
    $(document).triggerHandler('load');
  });

  $(document).on('load', function() {
    if (filter === '') return true;
    $filter = $list.clone();
    $filter.toggleClass('todo-filter-list');
    $filter.children()[filter === 'active' ? 'filter' : 'not']('.completed').remove();
    $list.hide().after($filter);
  });

  $(document).on('change', '#toggle-all', function() {
    var completeAll;
    completeAll = $(this).filter(':checked').length > 0
    $list.children().toggleClass('completed', completeAll).find('.toggle')[completeAll ? 'attr' : 'removeAttr']('checked', 'checked');
    $(document).triggerHandler('save');
  });

  $(document).on('submit', '#create-todo', function() {
    $template.clone()
      .find('label').html(this.newTodo.value).end()
      .find('.edit').attr('value', this.newTodo.value).end()
      .prependTo($list);
    this.reset();
    $(document).triggerHandler('save');
    return false;
  });

  $(document).on('change', '.toggle', function(e) {
    updateTodo(this, function($todo, element) {
      $todo.toggleClass('completed').find('.toggle')[$(element).filter(':checked').length ? 'attr' : 'removeAttr']('checked', 'checked')
    });
  });

  $(document).on('dblclick', '.view label', function() {
    $(this).parents('li').toggleClass('editing', true).find('.edit').focus().select();
  });

  $(document).on('blur', '.edit', function() {
    $(this).parents('li').toggleClass('editing', false);
  });

  $(document).on('submit', '.edit-todo', function(e) {
    updateTodo(this, function($todo, element) {
      $todo.find('label').html(e.target.editTodo.value);
      $(element).parents('li').toggleClass('editing', false);
    });
    return false;
  });

  $(document).on('click', '.destroy', function() {
    updateTodo(this, function($todo) { $todo.remove(); });
  });

  $(document).on('click', '#filters a', function() {
    setTimeout(function() { $(document).triggerHandler('load'); }, 0);
  });

  $(document).on('click', '#clear-completed', function() {
    $list.find('.completed').remove();
    $(document).triggerHandler('save');
  });

  $(document).triggerHandler('load');  
})( window );
