import frappe


def on_update(doc, method):
    if doc.status == "Completed" and doc.custom_maintenance_request:
        frappe.db.set_value(
            "Asset Maintenance Request", 
            doc.custom_maintenance_request, 
            "status", 
            "In-Review"
        )
        frappe.db.commit()
