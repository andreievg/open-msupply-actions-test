use async_graphql::*;

use repository::vaccine_course::vaccine_course_item_row::VaccineCourseItemRow;

#[derive(PartialEq, Debug)]
pub struct VaccineCourseItemNode {
    pub vaccine_course_item: VaccineCourseItemRow,
}

#[Object]
impl VaccineCourseItemNode {
    pub async fn id(&self) -> &str {
        &self.row().id
    }

    pub async fn item_id(&self) -> &str {
        // TODO Look up item_id
        &self.row().item_link_id
    }
}

impl VaccineCourseItemNode {
    pub fn from_domain(vaccine_course_item: VaccineCourseItemRow) -> VaccineCourseItemNode {
        VaccineCourseItemNode {
            vaccine_course_item,
        }
    }

    pub fn row(&self) -> &VaccineCourseItemRow {
        &self.vaccine_course_item
    }
}
