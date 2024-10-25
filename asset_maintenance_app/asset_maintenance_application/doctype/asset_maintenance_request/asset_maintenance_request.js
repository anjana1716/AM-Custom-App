// Copyright (c) 2024, anjana-menon and contributors
// For license information, please see license.txt

frappe.ui.form.on("Asset Maintenance Request", {
    
    setup: function(frm) {
        frm.set_query("asset", function() {
            return {
                filters: [
                    ["status", "=", "In Use"]
                ]
            };
        });
    },

    refresh: function(frm) {
        if (!frm.is_new() && frappe.user.has_role('Maintenance Team Supervisor')) {
            frm.add_custom_button(__('Create Maintenance Task'), function() {
                create_maintenance_task(frm);
            }).css({
                'background-color': '#002D62',
                'color': '#FFFFFF'
            });
        }
    }
    
});

function create_maintenance_task(frm) {
   
    let task_subject = frm.doc.asset__name + "-" + frm.doc.maintenance_type + "-" + frm.doc.name;
    let today = frappe.datetime.now_date();
  
    frappe.call({
        method: 'frappe.client.insert',
        args: {
            doc: {
                doctype: 'Task',
                subject: task_subject,
                priority: frm.doc.priority,
                exp_start_date: today,
                exp_end_date: frm.doc.expected_completion_date,
                status: 'Open',
                custom_maintenance_request: frm.doc.name
            }
        },
        callback: function(response) {
            if (response && response.message) {
                frappe.msgprint(__('Task created successfully: ' + response.message.name));
                
                
                frappe.call({
                    method: 'frappe.client.set_value',
                    args: {
                        doctype: 'Asset Maintenance Request',
                        name: frm.doc.name,
                        fieldname: 'status',
                        value: 'In-Progress'
                    },
                    callback: function() {
                        frm.reload_doc(); 
                    }
                });
            }
        }
    });
}

