<?php

/**
 * This template displays custom fields in the search form.
 */
?>

<?php if( $acadp_query->have_posts() ) : ?>
    <?php while( $acadp_query->have_posts() ) : $acadp_query->the_post(); $field_meta = get_post_meta( $post->ID ); ?>

            <label><?php the_title(); ?></label>

            <?php
            $value = '';
            if( isset( $_GET['custom_field'][ $post->ID ] ) ) {
                $value = $_GET['custom_field'][ $post->ID ];
            }

            switch( $field_meta['type'][0] ) {
                case 'text' :
                    printf( '<input type="text" name="custom_field[%d]" class="form-control" value="%s"/>', $post->ID, esc_attr( $value ) );
                    break;
                case 'textarea' :
                    printf( '<textarea name="custom_field[%d]" class="form-control" rows="%d">%s</textarea>', $post->ID, (int) $field_meta['rows'][0], esc_textarea( $value ) );
                    break;
                case 'select' :
                    $choices = $field_meta['choices'][0];
                    $choices = explode( "\n", trim( $choices ) );

                    printf( '<div class="select-basic"><select name="custom_field[%d]" class="form-control">', $post->ID );

                        printf( '<option value="">%s</option>', '- '.__( 'Select an Option', ATBDP_TEMPLATES_DIR ).' -' );

                    foreach( $choices as $choice ) {
                        if( strpos( $choice, ':' ) !== false ) {
                            $_choice = explode( ':', $choice );
                            $_choice = array_map( 'trim', $_choice );

                            $_value  = $_choice[0];
                            $_label  = $_choice[1];
                        } else {
                            $_value  = trim( $choice );
                            $_label  = $_value;
                        }

                        $_selected = '';
                        if( trim( $value ) == $_value ) $_selected = ' selected="selected"';

                        printf( '<option value="%s"%s>%s</option>', $_value, $_selected, $_label );
                    }
                    echo '</select></div>';
                    break;
                case 'checkbox' :
                    $choices = $field_meta['choices'][0];
                    $choices = explode( "\n", trim( $choices ) );

                    $values = array_map( 'trim', (array) $value );

                    echo '<div class="bads-custom-checks">';
                    foreach( $choices as $choice ) {
                        if( strpos( $choice, ':' ) !== false ) {
                            $_choice = explode( ':', $choice );
                            $_choice = array_map( 'trim', $_choice );

                            $_value  = $_choice[0];
                            $_label  = $_choice[1];
                        } else {
                            $_value  = trim( $choice );
                            $_label  = $_value;
                        }
                        $_for = rand();
                        $_checked = '';

                        if( in_array( $_value, $values ) ) $_checked = ' checked="checked"';

                        printf( '<div class="custom-control custom-checkbox checkbox-outline checkbox-outline-primary"><input type="checkbox" name="custom_field[%d][]" id="%d" class="custom-control-input" value="%s"%s><span class="check--select"></span><label for="%d" class="custom-control-label">%s</label></div>', $post->ID,$_for, $_value, $_checked,$_for, $_label );
                    }
                    echo '</div>';
                    echo '<a href="#" class="more-or-less sml">'.__('Show More', 'directorist').'</a>';
                    break;
                case 'radio' :
                    $choices = $field_meta['choices'][0];
                    $choices = explode( "\n", trim( $choices ) );
                    echo "<div class='atbdp_custom_radios'>";
                    foreach( $choices as $choice ) {
                        if( strpos( $choice, ':' ) !== false ) {
                            $_choice = explode( ':', $choice );
                            $_choice = array_map( 'trim', $_choice );

                            $_value  = $_choice[0];
                            $_label  = $_choice[1];
                        } else {
                            $_value  = trim( $choice );
                            $_label  = $_value;
                        }
                        $_for = rand();
                        $_checked = '';
                        if( trim( $value ) == $_value ) $_checked = ' checked="checked"';

                        printf( '<div class="custom-control custom-checkbox checkbox-outline checkbox-outline-primary"><input type="radio" class="custom-control-input" name="custom_field[%d]" id="%d" value="%s"%s><span class="radio--select"></span><label class="custom-control-label" for="%d">%s</label></div>', $post->ID,$_for, $_value, $_checked,$_for, $_label );
                    }
                    echo "</div>";
                    break;
                case 'url' :
                    printf( '<input type="text" name="custom_field[%d]" class="form-control" value="%s"/>', $post->ID, esc_url( $value ) );
                    break;
                case 'date' :
                    printf( '<input type="date" name="custom_field[%d]" class="form-control" value="%s"/>', $post->ID,  $value  );
                    break;
                case 'color' :
                    ?>
                    <script>
                        jQuery(document).ready(function ($) {
                            $('.search-color-field').wpColorPicker().empty();
                            $('.wp-color-picker').empty();
                        });
                    </script>
                <?php
                    printf( '<input type="color" name="custom_field[%d]" class="search-color-field" value="%s"/>', $post->ID,  $value  );

                    break;
                case 'time' :
                    printf( '<input type="time" name="custom_field[%d]" class="form-control" value="%s"/>', $post->ID,  $value  );
                    break;
            }
            ?>

    <?php endwhile; ?>
<?php endif; ?>