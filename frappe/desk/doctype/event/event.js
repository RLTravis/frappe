// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt
frappe.provide('frappe.desk');

frappe.ui.form.on(
	'Event',
	{
		onload: (frm) => {
			frm.set_query(
				'reference_doctype',
				'event_participants',
				() => {
					return {
						filters: {
							issingle: 0,
						},
					};
				}
			);

			if (!frappe.user.has_role('CalendarAdmin')) {
				frm.set_query(
					'google_calendar',
					() => {
						return {
							filters: {
								owner: frappe.session.user,
							},
						};
					}
				);
			}
		},
		refresh: (frm) => {
			if (frm.doc.event_participants) {
				frm.doc.event_participants.forEach((value) => {
					frm.add_custom_button(
						__(value.reference_docname),
						() => {
							frappe.set_route('Form', value.reference_doctype, value.reference_docname);
						},
						__('Participants')
					);
				})
			}
		},
		repeat_on: (frm) => {
			if (frm.doc.repeat_on === 'Every Day') {
				[
					'monday',
					'tuesday',
					'wednesday',
					'thursday',
					'friday',
					'saturday',
					'sunday',
				].map((v) => {
					frm.set_value(v, 1);
				});
			}
		},
	}
);

frappe.ui.form.on(
	'Event Participants',
	{
		event_participants_remove: (frm, cdt, cdn) => {
			if (cdt && !cdn.startsWith('new-event-participants-')) {
				frappe.call(
					{
						type: 'POST',
						method: 'frappe.desk.doctype.event.event.delete_communication',
						args: {
							event: frm.doc,
							reference_doctype: cdt,
							reference_docname: cdn,
						},
						freeze: true,
						callback: (r) => {
							if (r.exc) {
								frappe.show_alert(
									{
										message: __('{0}', [r.exc]),
										indicator: 'orange',
									}
								);
							}
						},
					}
				);
			}
		},
	}
);

frappe.desk.eventParticipants = class eventParticipants {
	constructor(frm, doctype) {
		this.frm = frm;
		this.doctype = doctype;
		this.make();
	}

	make() {
		let me = this;
		let table = me.frm.get_field('event_participants').grid;

		new frappe.ui.form.LinkSelector(
			{
				doctype: me.doctype,
				dynamic_link_field: 'reference_doctype',
				dynamic_link_reference: me.doctype,
				fieldname: 'reference_docname',
				target: table,
				txt: '',
			}
		);
	}
};
