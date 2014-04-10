(function( window ) {
	'use strict';

  function TodoItem(element) {
    if (! element) {
      this.$todo = list.$template.clone();
    } else if (list.$list.children().has(element)) {
      this.$todo = $(element);
    } else {
      this.element = element;
      this.$todo = $(element).parents('li');
      if (list.filter !== '') {
        this.index = list.$filter.children().index(this.$todo);
        this.$todo = list.$list.children()[list.filter === 'active' ? 'not' : 'filter']('.completed').eq(this.index);
      }
    }
  }
  
  TodoItem.prototype.toggleEditing = function(editing) {
    $(this.element).parents('li').toggleClass('editing', editing);
    if (editing) $(this.element).parents('li').find('.edit').focus().select();
  };

  TodoItem.prototype.updateText = function(text) {
    this.$todo.find('label').html(text);
    this.$todo.find('.edit').attr('value', text)
    this.save();
  };

  TodoItem.prototype.setCompleted = function(completed) {
    this.$todo.toggleClass('completed', completed).find('.toggle')[completed ? 'attr' : 'removeAttr']('checked', 'checked');
    this.save();
  };

  TodoItem.prototype.destroy = function() {
    this.$todo.remove();
    list.save();
  };

  TodoItem.prototype.save = function() {
    if (this.element) $(this.element).parents('li').toggleClass('editing', false);
    else this.$todo.prependTo(list.$list);
    list.save();
  };

  function TodoList() {
    this.filter = window.location.href.split('#/')[1];
    this.linkIndex = {'': 0, 'active': 1, 'completed': 2}[this.filter];
    this.total = this.$list.children().length;
    this.complete = this.$list.find('.completed').length;
    this.remaining = this.$list.children().not('.completed').length;
  }

  TodoList.prototype.$list = $('#todo-list');
  TodoList.prototype.$template = $('#todo-template').children(0);
  
  TodoList.prototype.save = function(transaction) {
    if (this.transaction) return;
    if (! transaction) {
      $(document).triggerHandler('save') && return;
    }
    this.transaction = transaction;
    this.transaction();
    this.transaction = undefined;
    $(document).triggerHandler('save');
  };

  TodoList.prototype.toggleAllCompleted = function(completed) {
    this.save(function() {
      this.$list.children().each(function() {
        new TodoItem(this).setCompleted(completed);
      });
    });
  };

  TodoList.prototype.clearCompleted = function() {
    this.$list.find('.completed').remove();
    this.save();
  };

  TodoList.prototype.reload = function() {
    $(document).triggerHandler('reload');
  };

  var list;

  function on() { $.fn.on.apply($(document), arguments); }

  on('reload', function() {
    if (list && list.$filter) list.$filter.remove();
    TodoList.prototype.$list.show().html(localStorage.getItem('just-jquery-todomvc'));
    list = new TodoList();
    $('#main, #footer')[list.total === 0 ? 'hide' : 'show']();
    $('#toggle-all')[list.total > 0 && list.remaining == 0 ? 'prop' : 'removeAttr']('checked', 'checked');
    if (list.total === 0) return;
    $('#filters li a').each(function(index) {
      $(this).toggleClass('selected', index === list.linkIndex);
    });
    $('#todo-count').find('strong').text(list.remaining)
    $('#clear-completed').html(list.complete == 0 ? '' : 'Clear completed (' + list.complete + ')');
  });

  on('save', function() {
    localStorage.setItem('just-jquery-todomvc', list.$list.html());
    list.reload();
  });

  on('reload', function() {
    if (list.filter === '') return true;
    list.$filter = list.$list.clone();
    list.$filter.toggleClass('todo-filter-list');
    list.$filter.children()[list.filter === 'active' ? 'filter' : 'not']('.completed').remove();
    list.$list.hide().after(list.$filter);
  });

  on('change', '#toggle-all', function() {
    list.toggleAllCompleted($(this).filter(':checked').length > 0)
  });

  on('submit', '#create-todo', function() {
    new TodoItem().updateText(this.newTodo.value);
    this.reset();
  });

  on('change', '.toggle', function() {
    new TodoItem(this).setCompleted($(this).filter(':checked').length > 0);
  });

  on('dblclick', '.view label', function() {
    new TodoItem(this).toggleEditing(true);
  });

  on('blur', '.edit', function() {
    new TodoItem(this).toggleEditing(false);
  });

  on('submit', '.edit-todo', function() {
    new TodoItem(this).updateText(this.editTodo.value);
  });

  on('click', '.destroy', function() {
    new TodoItem(this).destroy();
  });

  on('click', '#filters a', function() {
    setTimeout(function() { list.reload(); }, 0);
  });

  on('click', '#clear-completed', function() {
    list.clearCompleted();
  });

  TodoList.prototype.reload();
})( window );
