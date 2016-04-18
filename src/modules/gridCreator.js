
define(['jquery',
	'backbone',
	'underscore',
	'mustache',
	'gridster',
	'd3'
], function($,
	Backbone,
	_,
	Mustache,
	Gridster,
	d3
	) {


	var GridCreator = function(numberOfStreams) {
		
		var 
			that = {}, my = {};
		
		
		that.el ='.wrapper';

		that.gridsterConfiguration = {
					widget_margins: [5, 5],
					widget_base_dimensions: [40, 40],
					autogenerate_stylesheet: true,
					resize: {
						enabled: true,
						max_size: [25, 10],
						min_size: [1, 1]
						}
		};
		
		that.gridster = {};
		
		that.events = {
			'click .addBlock': 'getNewSelectorBox',
			'click .freeze-block': 'freezeBlocks',
			'click .cancel-box': 'cancelWidget',
			'click .chart': 'selectChartType',
			'mouseover .gs-w': 'showCancelButton',
			'mouseleave .gs-w': 'hideCancelButton',
			'mouseover .selector-box': 'highlightBoxes',
			'mouseleave .selector-box': 'unhighlightBoxes',
			'click .selector-box': 'bindBox'
		};
		
		that.widgetsConfiguration = {

			1 : [
					[6, 6]
			],

			2:  [
					[6, 6],
					[6, 6]
			],

			3: [
					[6, 6],
					[6, 6],
					[6, 6]
			],

			4:  [
					[5, 5],
					[5, 5],
					[5, 5],
					[5, 5],
			],

			5:  [
					[3, 1],
					[1, 3],
					[1, 3],
					[1, 3],
					[3, 2]
			],

			6:  [
					[3, 1],
					[1, 3],
					[1, 3],
					[1, 3],
					[3, 2],
					[6, 1]
			],

			7:  [
					[3, 1],
					[1, 3],
					[1, 3],
					[1, 3],
					[3, 2],
					[3, 1],
					[3, 1]
			],

			8:  [
					[3, 1],
					[1, 3],
					[1, 3],
					[1, 3],
					[3, 2],
					[3, 1],
					[3, 1],
					[6, 1]
			],

			9:  [
					[3, 1],
					[1, 3],
					[1, 3],
					[1, 3],
					[3, 2],
					[3, 1],
					[3, 1],
					[3, 1],
					[3, 1]
			],

			10:  [
					[3, 1],
					[1, 3],
					[1, 3],
					[1, 3],
					[3, 2],
					[3, 1],
					[3, 1],
					[3, 1],
					[3, 1],
					[6, 1]
			]				
		};

		that.widgetTemplate = 
							'<div class="{{index}}">' +
								'<i class="hidden  chart spider-chart fa fa-asterisk"></i>' +
								'<i class="hidden chart line-chart fa fa-line-chart"></i>' +
								'<i class="hidden cancel-box fa fa-times"></i>' +
							'</div>';

		
		that.selectorTemplate = 
						'<div class="placeholder-box" style="left:10px">' +
							'<div class="button-wrapper">' +
								'{{#selectorbox}}' +
								'<a class="selector-box {{.}}" data-key="{{.}}"></a>' +
								'{{/selectorbox}}' +
							'</div>' +
						'</div>';

		that.selectorData = {'selectorbox': _.range(1, numberOfStreams + 1)};

						
		that.gridTemplate =  '<ul class="{{currentElement}}"></ul>';

		
		that.data = {'currentElement' : 0};



		that.showCancelButton = function(event) {

			var buttons = event.target.parentElement.children;

			$('.cancel-box').not(buttons).addClass('hidden');
			$('.line-chart').not(buttons).addClass('hidden');
			$('.spider-chart').not(buttons).addClass('hidden');
			$(event.target).find('.cancel-box').removeClass('hidden');
			$(event.target).find('.line-chart').removeClass('hidden');
			$(event.target).find('.spider-chart').removeClass('hidden');
		};
		

		that.hideCancelButton = function(event) {
			$(event.target).find('.cancel-box').addClass('hidden');
			$(event.target).find('.line-chart').addClass('hidden');
			$(event.target).find('.spider-chart').addClass('hidden');
		};			


		that.selectChartType = function(event) {
			var target = $(event.target),
				parent = target.parent();

			parent.data('data-type', undefined);
			parent.find('.chart').removeClass('selected');
			target.addClass('selected')
			if(target.hasClass('line-chart')) {
				parent.attr('data-type', 'line');
			} else {
				parent.attr('data-type','spider');
			}
		};


		that.bindGridsterToElement = function(index) {
			that.gridster[index] = $(".gridster > ul." + index).gridster(that.gridsterConfiguration).data('gridster');
		};


		that.getNewSelectorBox = function() {
			var html = Mustache.render(that.selectorTemplate, that.selectorData)
			that.$el.find('.sub-wrapper').append(html);
		};
		
		that.highlightBoxes = function() {
			var 
				box = event.target,
				outerBox = $(event.target).parent(),
				numOfBoxes = box.dataset.key,
				rangeBoxes = _.range(1,parseInt(numOfBoxes) + 1),
				classes = _.map(rangeBoxes, function(num){ return '.' + num ; });
				
			_.forEach(classes, function(entry){
				$(outerBox).find(entry).addClass('select');
			})	
				console.log(classes)
				
			
		}
		
		that.unhighlightBoxes = function() {
			
			$('.select').removeClass('select');
		}
		
		
		that.freezeBlocks = function() {

			if ( !$('.gridster').length) {
				return;
			}

			that.$el.off();
		//	$(document.body).off('dblclick');		
			that.removeStylingfromBlocks();

			var keys = _.keys(that.gridster);
			keys.forEach(function(key){
				if (that.gridster[key] !== undefined) {
					that.gridster[key].disable();
				}
			})
			that.trigger('gridCreated');
		};
		

		
		that.removeStylingfromBlocks = function() {
			that.$el.find('.placeholder-box').remove();
			$('.gridster').find('span').toggleClass('hidden');
			$('.gridster').find('div').toggleClass('no-hover');
			$('.gridster').children().css({'border':'transparent'});
			$('.gs-w').css({'border':'transparent'});
			$('.addBlock').toggleClass('hidden');
			$('.freeze-block').toggleClass('hidden');
			$('.gridster ul').css({'background-color':'transparent'});
			$('i').remove();
			$('span').remove();
		};
		
		
		that.cancelWidget = function(event) {
				var 
					ul = $(event.target).parents('ul'),
					i = parseInt(ul.attr('class')),
					numOfBlocks = that.$el.find('.gridster').length;
				
				if (ul.children().length < 2) {
					that.gridster[i].destroy();
					ul.parents('.gridster').fadeOut(10).remove();

					if (numOfBlocks < 2){
						that.$el.find('.freeze-block').addClass('locked');
					}
					return;
				}

				that.gridster[i].remove_widget(event.target.parentElement, 10);		
		};
		
		
		that.bindBox = function(event) { 

			that.data.currentElement += 1;
			
			var
				index = that.data.currentElement,
				html = Mustache.to_html(that.gridTemplate, that.data),
				numOfElements = parseInt(event.target.dataset.key),
				parent = $(event.target.parentElement.parentElement);
				
			parent.removeClass('placeholder-box');
			parent.addClass('gridster')
			parent.html(html)
			that.bindGridsterToElement(index);

			$.each(that.widgetsConfiguration[numOfElements], function(i, widget){
				var template = Mustache.to_html(that.widgetTemplate, {'index': 'indx_' + index + '_' + (i + 1)});
				widget = [template].concat(widget)
				that.gridster[index].add_widget.apply(that.gridster[index], widget)  
			});			

			if( $('.freeze-block').hasClass('locked')) {
				$('.freeze-block').removeClass('locked');
			}
		};
				
		
		that = new (Backbone.View.extend(that))();
		
		return that;
	};
	
	return GridCreator;
	
});
	
